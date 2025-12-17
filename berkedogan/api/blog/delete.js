import jwt from "jsonwebtoken";
import { parse } from "cookie";

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;
  if (!token) return res.status(401).json({ success: false, error: "Missing token" });

  try {
    jwt.verify(token, process.env.JWT_SECRET || "default-dev-secret");
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  const { id } = req.body || {};
  const safeId = String(id || "").trim();
  if (!safeId) return res.status(400).json({ success: false, error: "Missing id" });

  let owner;
  let repo;
  let tokenGH;
  let branch;
  let targetDir;

  try {
    owner = mustEnv("GITHUB_OWNER");
    repo = mustEnv("GITHUB_REPO");
    tokenGH = mustEnv("GITHUB_TOKEN");
    branch = process.env.GITHUB_BRANCH || "main";
    targetDir = process.env.BLOG_ENTRIES_DIR || "blog/src/data/blog-entries";
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || "Missing env" });
  }

  try {
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

    const listJson = await listRes.json().catch(() => null);
    if (!listRes.ok) {
      return res.status(500).json({ success: false, error: "GitHub list failed", details: listJson });
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
      branch,
    };

    const delRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(item.path)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenGH}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "berkedogan-panel",
        },
        body: JSON.stringify(delBody),
      }
    );

    const delJson = await delRes.json().catch(() => null);
    if (!delRes.ok) {
      return res.status(500).json({ success: false, error: "GitHub delete failed", details: delJson });
    }

    const hook = process.env.BLOG_BUILD_HOOK_URL;
    if (hook) {
      try {
        await fetch(hook, { method: "POST" });
      } catch {
        return res.status(200).json({ success: true, id: safeId, build: { triggered: false, error: "hook_failed" } });
      }
    }

    return res.status(200).json({ success: true, id: safeId, build: { triggered: Boolean(hook) } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error", details: err?.message || String(err) });
  }
}
