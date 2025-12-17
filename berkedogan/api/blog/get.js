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

function fromBase64(b64) {
  return Buffer.from(String(b64 || ""), "base64").toString("utf8");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
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

  const id = String(req.query?.id || "").trim();
  if (!id) return res.status(400).json({ success: false, error: "Missing id" });

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
          return meta?.id === id;
        })
      : null;

    if (!item?.path) {
      return res.status(404).json({ success: false, error: "Entry not found" });
    }

    const meta = parseEntryName(item.name);

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(item.path)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${tokenGH}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "berkedogan-panel",
        },
      }
    );

    const fileJson = await fileRes.json().catch(() => null);
    if (!fileRes.ok) {
      return res.status(500).json({ success: false, error: "GitHub read failed", details: fileJson });
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
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error", details: err?.message || String(err) });
  }
}
