import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { randomUUID } from "crypto";

function mustEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function toBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function isValidDateISO(dateISO) {
  return typeof dateISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateISO);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // JWT auth (reuse existing cookie approach)
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing token" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "default-dev-secret");
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  const { dateISO, markdown } = req.body || {};

  if (!isValidDateISO(dateISO)) {
    return res.status(400).json({ success: false, error: "Invalid dateISO" });
  }

  if (typeof markdown !== "string" || markdown.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Missing markdown" });
  }

  // ID: tarih + uuid (slug yok)
  const id = randomUUID();
  const fileName = `${dateISO}__${id}.md`;

  let owner;
  let repo;
  let tokenGH;
  let branch;
  let targetDir;
  let path;

  try {
    // Repo içine write: GitHub Contents API ile commit
    // targetPath örn: blog/src/data/blog-entries/YYYY-MM-DD__uuid.md
    owner = mustEnv("GITHUB_OWNER");
    repo = mustEnv("GITHUB_REPO");
    tokenGH = mustEnv("GITHUB_TOKEN");
    branch = process.env.GITHUB_BRANCH || "main";
    targetDir = process.env.BLOG_ENTRIES_DIR || "blog/src/data/blog-entries";
    path = `${targetDir}/${fileName}`;
  } catch (e) {
    console.error("[blog/publish] Missing env", e);
    return res.status(500).json({
      success: false,
      error: e?.message || "Missing environment variables",
    });
  }

  const body = {
    message: `blog: add ${fileName}`,
    content: toBase64(markdown.endsWith("\n") ? markdown : `${markdown}\n`),
    branch,
  };

  try {
    // Enforce: günde 1 yazı (dateISO__*.md varsa yayınlama)
    const listRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(targetDir)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${tokenGH}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "berkedogan-panel",
        },
      }
    );

    if (listRes.ok) {
      const listJson = await listRes.json().catch(() => null);
      if (Array.isArray(listJson)) {
        const already = listJson.some(
          (item) => typeof item?.name === "string" && item.name.startsWith(`${dateISO}__`) && item.name.endsWith(".md")
        );
        if (already) {
          return res.status(409).json({
            success: false,
            error: "Bu tarih için zaten bir yazı var.",
          });
        }
      }
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenGH}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "berkedogan-panel",
        },
        body: JSON.stringify(body),
      }
    );

    const ghJson = await ghRes.json().catch(() => null);

    if (!ghRes.ok) {
      return res.status(500).json({
        success: false,
        error: "GitHub write failed",
        details: ghJson,
      });
    }

    // Build tetikle (opsiyonel): Vercel Deploy Hook
    const hook = process.env.BLOG_BUILD_HOOK_URL;
    if (hook) {
      try {
        await fetch(hook, { method: "POST" });
      } catch {
        // Hook fail bile olsa commit başarılı; sadece bilgi dön.
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
  } catch (err) {
    console.error("[blog/publish] Server error", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err?.message || String(err),
    });
  }
}
