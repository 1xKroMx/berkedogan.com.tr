import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "../lib/db.js";
import { toIstanbulIsoString } from "../lib/time.js";

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

    if (req.method === "POST" && action === "complete") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: "Missing task ID" });
      }

      const sql = getSql();
      const rows = await sql`
        UPDATE tasks
        SET completed = NOT completed
          , "completedAt" = CASE WHEN NOT completed THEN NOW() ELSE NULL END
        WHERE id = ${id}
        RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline, "isVisible"
      `;

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      return res.json({
        success: true,
        task: {
          ...rows[0],
          completedAt: toIstanbulIsoString(rows[0].completedAt),
        },
      });
    }

    if (req.method === "POST" && action === "create") {
      const { title, isRecurring, interval } = req.body;

      if (!title || !interval) {
        return res
          .status(400)
          .json({ success: false, error: "Missing title or duration" });
      }

      let deadline = null;
      if (interval && interval > 0) {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(interval));
        deadline = date.toISOString();
      } else {
        return res
          .status(400)
          .json({ success: false, error: "Duration must be greater than 0" });
      }

      const sql = getSql();
      const rows = await sql`
        INSERT INTO tasks (title, completed, "isRecurring", "interval", deadline, "isVisible")
        VALUES (${title}, false, ${isRecurring || false}, ${interval || null}, ${deadline}, true)
        RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline, "isVisible"
      `;

      return res.json({
        success: true,
        task: {
          ...rows[0],
          completedAt: toIstanbulIsoString(rows[0].completedAt),
        },
      });
    }

    if (req.method === "POST" && action === "update") {
      const { id, title, isRecurring, interval } = req.body;

      if (!id || !title) {
        return res
          .status(400)
          .json({ success: false, error: "Missing id or title" });
      }

      let deadline = null;
      if (interval && interval > 0) {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(interval));
        deadline = date.toISOString();
      }

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
        task: {
          ...rows[0],
          completedAt: toIstanbulIsoString(rows[0].completedAt),
        },
      });
    }

    if (req.method === "POST" && action === "delete") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: "Missing task ID" });
      }

      const sql = getSql();
      const rows = await sql`
        DELETE FROM tasks
        WHERE id = ${id}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      return res.json({ success: true, id: rows[0].id });
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
              isRecurring = false
              AND deadline IS NOT NULL
              AND deadline <= NOW() - INTERVAL '24 hours'
            )
            OR (
              completed = true
              isRecurring = false
              AND "completedAt" IS NOT NULL
              AND "completedAt" <= NOW() - INTERVAL '24 hours'
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
