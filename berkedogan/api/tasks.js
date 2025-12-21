import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "./_db.js";
import { toIstanbulIsoString } from "./_time.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const action = req.query?.action;

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

  try {
    if (req.method === "GET" && !action) {
      const sql = getSql();
      const rows = await sql`
        SELECT id, title, completed, "completedAt", "isRecurring", "interval", deadline FROM tasks WHERE "isVisible" = true ORDER BY id ASC
      `;

      return res.json({
        success: true,
        tasks: rows.map((task) => ({
          ...task,
          completedAt: toIstanbulIsoString(task.completedAt),
        })),
      });
    }

    if (req.method === "POST" && action === "reset") {
      const sql = getSql();
      const rows = await sql`
        UPDATE tasks
        SET "isVisible" = false
        WHERE
          "isVisible" = true
          AND (
            (
              completed = false
              AND deadline IS NOT NULL
              AND deadline <= NOW() - INTERVAL '24 hours'
            )
            OR (
              completed = true
              AND "completedAt" IS NOT NULL
              AND deadline IS NOT NULL
              AND GREATEST(deadline, "completedAt") <= NOW() - INTERVAL '24 hours'
            )
          )
        RETURNING id
      `;

      return res.json({ success: true, updatesPerformed: rows.length });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  } catch (err) {
    logDbError(err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
