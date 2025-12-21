import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "./_db.js";

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

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
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
        tasks: rows,
      });
    }

    if (req.method === "POST" && action === "reset") {
      const sql = getSql();
      const expiredTasks = await sql`
        SELECT id, "isRecurring", "interval"
        FROM tasks
        WHERE deadline <= NOW() AND "isVisible" = true
      `;

      let updates = 0;

      for (const task of expiredTasks) {
        if (task.isRecurring) {
          const newDeadline = new Date();
          newDeadline.setDate(newDeadline.getDate() + task.interval);

          await sql`
            UPDATE tasks
            SET completed = false, "completedAt" = NULL, deadline = ${newDeadline.toISOString()}
            WHERE id = ${task.id}
          `;
        } else {
          await sql`
            UPDATE tasks
            SET "isVisible" = false
            WHERE id = ${task.id}
          `;
        }
        updates++;
      }

      return res.json({ success: true, updatesPerformed: updates });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  } catch (err) {
    logDbError(err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
