import jwt from "jsonwebtoken";

import { parse } from "cookie";
import { randomUUID } from "crypto";

function mustEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function parseEntryName(name) {
  const match = String(name).match(/^(\d{4}-\d{2}-\d{2})__(.+)\.md$/);
  if (!match) return null;
  return { dateISO: match[1], id: match[2] };
}

function toBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

function fromBase64(b64) {
  return Buffer.from(String(b64 || ""), "base64").toString("utf8");
}

function isValidDateISO(dateISO) {
  return typeof dateISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateISO);
}

function requireBlogEnv() {
  const owner = mustEnv("GITHUB_OWNER");
  const repo = mustEnv("GITHUB_REPO");
  const tokenGH = mustEnv("GITHUB_TOKEN");
  const branch = process.env.GITHUB_BRANCH || "main";
  const targetDir = process.env.BLOG_ENTRIES_DIR || "blog/src/data/blog-entries";
  return { owner, repo, tokenGH, branch, targetDir };
}

function verifyAuth(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) {
    res.status(401).json({ success: false, error: "Missing token" });
    return false;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "default-dev-secret");
    return true;
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!verifyAuth(req, res)) return;

  const action = String(req.query?.action || "").trim();

  let env;
  try {
    env = requireBlogEnv();
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, error: e?.message || "Missing env" });
  }

  try {
    if (req.method === "GET" && action === "entries") {
      const listRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(env.targetDir)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      const json = await listRes.json().catch(() => null);
      if (!listRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub list failed", details: json });
      }

      const entries = Array.isArray(json)
        ? json
            .map((item) => {
              const meta = parseEntryName(item?.name);
              if (!meta) return null;
              return {
                id: meta.id,
                dateISO: meta.dateISO,
                name: item.name,
                path: item.path,
                sha: item.sha,
              };
            })
            .filter(Boolean)
        : [];

      entries.sort((a, b) => {
        if (a.dateISO !== b.dateISO)
          return String(b.dateISO).localeCompare(String(a.dateISO));
        return String(b.id).localeCompare(String(a.id));
      });

      return res.status(200).json({ success: true, entries });
    }

    if (req.method === "GET" && action === "get") {
      const id = String(req.query?.id || "").trim();
      if (!id) return res.status(400).json({ success: false, error: "Missing id" });

      const listRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(env.targetDir)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      const listJson = await listRes.json().catch(() => null);
      if (!listRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub list failed", details: listJson });
      }

      const item = Array.isArray(listJson)
        ? listJson.find((x) => {
            const meta = parseEntryName(x?.name);
            return meta?.id === id;
          })
        : null;

      if (!item?.path) {
        return res.status(404).json({ success: false, error: "Entry not found" });
      }

      const meta = parseEntryName(item.name);

      const fileRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(item.path)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      const fileJson = await fileRes.json().catch(() => null);
      if (!fileRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub read failed", details: fileJson });
      }

      const content = fromBase64(fileJson?.content);

      return res.status(200).json({
        success: true,
        id,
        dateISO: meta?.dateISO || "",
        path: item.path,
        sha: fileJson?.sha || item.sha,
        markdown: content,
      });
    }

    if (req.method === "POST" && action === "publish") {
      const { dateISO, markdown } = req.body || {};

      if (!isValidDateISO(dateISO)) {
        return res.status(400).json({ success: false, error: "Invalid dateISO" });
      }

      if (typeof markdown !== "string" || markdown.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Missing markdown" });
      }

      const id = randomUUID();
      const fileName = `${dateISO}__${id}.md`;
      const path = `${env.targetDir}/${fileName}`;

      const body = {
        message: `blog: add ${fileName}`,
        content: toBase64(markdown.endsWith("\n") ? markdown : `${markdown}\n`),
        branch: env.branch,
      };

      // Enforce: günde 1 yazı
      const listRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(env.targetDir)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      if (listRes.ok) {
        const listJson = await listRes.json().catch(() => null);
        if (Array.isArray(listJson)) {
          const already = listJson.some(
            (item) =>
              typeof item?.name === "string" &&
              item.name.startsWith(`${dateISO}__`) &&
              item.name.endsWith(".md")
          );
          if (already) {
            return res
              .status(409)
              .json({ success: false, error: "Bu tarih için zaten bir yazı var." });
          }
        }
      }

      const ghRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(path)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
          body: JSON.stringify(body),
        }
      );

      const ghJson = await ghRes.json().catch(() => null);
      if (!ghRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub write failed", details: ghJson });
      }

      const hook = process.env.BLOG_BUILD_HOOK_URL;
      if (hook) {
        try {
          await fetch(hook, { method: "POST" });
        } catch {
          return res.status(200).json({
            success: true,
            id,
            dateISO,
            path,
            build: { triggered: false, error: "hook_failed" },
          });
        }
      }

      return res.status(200).json({
        success: true,
        id,
        dateISO,
        path,
        build: { triggered: Boolean(hook) },
      });
    }

    if (req.method === "POST" && action === "update") {
      const { id, markdown } = req.body || {};
      const safeId = String(id || "").trim();

      if (!safeId)
        return res.status(400).json({ success: false, error: "Missing id" });
      if (typeof markdown !== "string" || markdown.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Missing markdown" });
      }

      const listRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(env.targetDir)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      const listJson = await listRes.json().catch(() => null);
      if (!listRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub list failed", details: listJson });
      }

      const item = Array.isArray(listJson)
        ? listJson.find((x) => {
            const meta = parseEntryName(x?.name);
            return meta?.id === safeId;
          })
        : null;

      if (!item?.path || !item?.sha) {
        return res.status(404).json({ success: false, error: "Entry not found" });
      }

      const putBody = {
        message: `blog: update ${item.name}`,
        content: toBase64(markdown.endsWith("\n") ? markdown : `${markdown}\n`),
        branch: env.branch,
        sha: item.sha,
      };

      const putRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(item.path)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
          body: JSON.stringify(putBody),
        }
      );

      const putJson = await putRes.json().catch(() => null);
      if (!putRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub update failed", details: putJson });
      }

      const hook = process.env.BLOG_BUILD_HOOK_URL;
      if (hook) {
        try {
          await fetch(hook, { method: "POST" });
        } catch {
          return res.status(200).json({
            success: true,
            id: safeId,
            build: { triggered: false, error: "hook_failed" },
          });
        }
      }

      return res
        .status(200)
        .json({ success: true, id: safeId, build: { triggered: Boolean(hook) } });
    }

    if (req.method === "POST" && action === "delete") {
      const { id } = req.body || {};
      const safeId = String(id || "").trim();
      if (!safeId)
        return res.status(400).json({ success: false, error: "Missing id" });

      const listRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(env.targetDir)}?ref=${encodeURIComponent(env.branch)}`,
        {
          headers: {
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
        }
      );

      const listJson = await listRes.json().catch(() => null);
      if (!listRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub list failed", details: listJson });
      }

      const item = Array.isArray(listJson)
        ? listJson.find((x) => {
            const meta = parseEntryName(x?.name);
            return meta?.id === safeId;
          })
        : null;

      if (!item?.path || !item?.sha) {
        return res.status(404).json({ success: false, error: "Entry not found" });
      }

      const delBody = {
        message: `blog: delete ${item.name}`,
        sha: item.sha,
        branch: env.branch,
      };

      const delRes = await fetch(
        `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodeGitHubPath(item.path)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.tokenGH}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "berkedogan-panel",
          },
          body: JSON.stringify(delBody),
        }
      );

      const delJson = await delRes.json().catch(() => null);
      if (!delRes.ok) {
        return res
          .status(500)
          .json({ success: false, error: "GitHub delete failed", details: delJson });
      }

      const hook = process.env.BLOG_BUILD_HOOK_URL;
      if (hook) {
        try {
          await fetch(hook, { method: "POST" });
        } catch {
          return res.status(200).json({
            success: true,
            id: safeId,
            build: { triggered: false, error: "hook_failed" },
          });
        }
      }

      return res
        .status(200)
        .json({ success: true, id: safeId, build: { triggered: Boolean(hook) } });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err?.message || String(err),
    });
  }
}
