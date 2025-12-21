import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
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

  const { id, title, isRecurring, interval } = req.body;

  if (!id || !title) {
    return res.status(400).json({ success: false, error: "Missing id or title" });
  }

  let deadline = null;
  if (interval && interval > 0) {
    const date = new Date();
    date.setDate(date.getDate() + parseInt(interval));
    deadline = date.toISOString();
  }

  try {
    const sql = getSql();
    const rows = await sql`
      UPDATE tasks
      SET 
        title = ${title},
        "isRecurring" = ${isRecurring || false},
        "interval" = ${interval || null},
        deadline = ${deadline}
      WHERE id = ${id}
      RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    return res.json({
      success: true,
      task: rows[0],
    });

  } catch (err) {
    logDbError(err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
