import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "../lib/db.js";
import { toIstanbulIsoString } from "../lib/time.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing token" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  const nodeNow = new Date();

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT NOW() AS "dbNow", CURRENT_SETTING('TimeZone') AS "dbTimeZone"
    `;

    const dbNow = rows?.[0]?.dbNow ?? null;
    const dbTimeZone = rows?.[0]?.dbTimeZone ?? null;

    return res.json({
      success: true,
      node: {
        nowIso: nodeNow.toISOString(),
        nowIstanbulIso: toIstanbulIsoString(nodeNow),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetMinutes: -nodeNow.getTimezoneOffset(),
      },
      db: {
        now: dbNow,
        nowIstanbulIso: toIstanbulIsoString(dbNow),
        timeZone: dbTimeZone,
      },
    });
  } catch (err) {
    logDbError(err);
    return res.status(500).json({
      success: false,
      error: "Database error",
      node: {
        nowIso: nodeNow.toISOString(),
        nowIstanbulIso: toIstanbulIsoString(nodeNow),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offsetMinutes: -nodeNow.getTimezoneOffset(),
      },
    });
  }
}
