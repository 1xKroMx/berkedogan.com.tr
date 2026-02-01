import jwt from "jsonwebtoken";
import { parse } from "cookie";

import { getSql, logDbError } from "../lib/db.js";
import { toIstanbulIsoString } from "../lib/time.js";
import { setCors } from "../lib/cors.js";
import { scheduleTaskNotification, cancelTaskNotification } from "../lib/qstash.js";

export default async function handler(req, res) {
  setCors(req, res);

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
      
      // Try with qstashMessageId first, fallback if column doesn't exist yet
      let rows;
      try {
        rows = await sql`
          SELECT id, title, completed, "completedAt", "isRecurring", "interval", deadline, "notifyEnabled", "notifyTime", "qstashMessageId" FROM tasks WHERE "isVisible" = true ORDER BY id ASC
        `;
      } catch (e) {
        // Column might not exist yet, try without it
        rows = await sql`
          SELECT id, title, completed, "completedAt", "isRecurring", "interval", deadline, "notifyEnabled", "notifyTime" FROM tasks WHERE "isVisible" = true ORDER BY id ASC
        `;
      }

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
        RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline, "isVisible", "notifyEnabled", "notifyTime"
      `;

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      const updatedTask = rows[0];
      
      // Try to fetch qstashMessageId separately (if column exists)
      try {
        const msgRows = await sql`SELECT "qstashMessageId" FROM tasks WHERE id = ${updatedTask.id}`;
        if (msgRows[0]) updatedTask.qstashMessageId = msgRows[0].qstashMessageId;
      } catch (e) {
        // Column doesn't exist yet, skip
      }
      
      // If completed, cancel pending notification.
      // If uncompleted (completed=false), reschedule.
      if (updatedTask.completed) {
          if (updatedTask.qstashMessageId) {
             try {
                await cancelTaskNotification(updatedTask.qstashMessageId);
                // Clear the ID from DB
                await sql`UPDATE tasks SET "qstashMessageId" = NULL WHERE id = ${updatedTask.id}`;
             } catch (e) {
                // Ignore if column doesn't exist
             }
             updatedTask.qstashMessageId = null;
          }
      } else {
          // Task un-completed, schedule if needed
          try {
              await scheduleTaskNotification(updatedTask);
          } catch (e) {
              console.error("Schedule error (non-fatal):", e);
          }
      }

      return res.json({
        success: true,
        task: {
          ...updatedTask,
          completedAt: toIstanbulIsoString(updatedTask.completedAt),
        },
      });
    }

    if (req.method === "POST" && action === "create") {
      const { title, isRecurring, interval, notifyEnabled, notifyTime } = req.body;

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
        INSERT INTO tasks (title, completed, "isRecurring", "interval", deadline, "isVisible", "notifyEnabled", "notifyTime")
        VALUES (${title}, false, ${isRecurring || false}, ${interval || null}, ${deadline}, true, ${notifyEnabled || false}, ${notifyTime || null})
        RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline, "isVisible", "notifyEnabled", "notifyTime"
      `;

      // Schedule notification if enabled
      if (rows[0]) {
          try {
              await scheduleTaskNotification(rows[0]);
          } catch (e) {
              console.error("Schedule notification error (non-fatal):", e);
          }
      }

      return res.json({
        success: true,
        task: {
          ...rows[0],
          completedAt: toIstanbulIsoString(rows[0].completedAt),
        },
      });
    }

    if (req.method === "POST" && action === "update") {
      const { id, title, isRecurring, interval, notifyEnabled, notifyTime } = req.body;

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
          deadline = ${deadline},
          "notifyEnabled" = ${notifyEnabled || false},
          "notifyTime" = ${notifyTime || null}
        WHERE id = ${id}
        RETURNING id, title, completed, "completedAt", "isRecurring", "interval", deadline, "notifyEnabled", "notifyTime"
      `;

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      // Schedule or cancel based on new state
      const task = rows[0];
      
      // Try to fetch qstashMessageId separately
      try {
        const msgRows = await sql`SELECT "qstashMessageId" FROM tasks WHERE id = ${task.id}`;
        if (msgRows[0]) task.qstashMessageId = msgRows[0].qstashMessageId;
      } catch (e) {
        // Column doesn't exist yet
      }
      
      if (task.notifyEnabled && task.notifyTime) {
          try {
              await scheduleTaskNotification(task);
          } catch (e) {
              console.error("Schedule error (non-fatal):", e);
          }
      } else {
          // If notifications disabled or time removed, cancel existing
          if (task.qstashMessageId) {
             try {
                await cancelTaskNotification(task.qstashMessageId);
                await sql`UPDATE tasks SET "qstashMessageId" = NULL WHERE id = ${task.id}`;
             } catch (e) {
                // Ignore if column doesn't exist
             }
          }
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
      
      // Try to get qstashMessageId before deleting
      let qstashMessageId = null;
      try {
        const msgRows = await sql`SELECT "qstashMessageId" FROM tasks WHERE id = ${id}`;
        if (msgRows[0]) qstashMessageId = msgRows[0].qstashMessageId;
      } catch (e) {
        // Column doesn't exist yet
      }
      
      const rows = await sql`
        DELETE FROM tasks
        WHERE id = ${id}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      if (qstashMessageId) {
          try {
              await cancelTaskNotification(qstashMessageId);
          } catch (e) {
              console.error("Cancel notification error (non-fatal):", e);
          }
      }

      return res.json({ success: true, id: rows[0].id });
    }

    if (req.method === "POST" && action === "reset") {
      const sql = getSql();
      const hiddenRows = await sql`
        UPDATE tasks
        SET "isVisible" = false
        WHERE
          "isVisible" = true
          AND "isRecurring" = false
          AND (
            (
              completed = false
              AND deadline IS NOT NULL
              AND deadline <= NOW() - INTERVAL '24 hours'
            )
            OR (
              completed = true
              AND "completedAt" IS NOT NULL
              AND "completedAt" <= NOW() - INTERVAL '24 hours'
            )
          )
        RETURNING id
      `;

      const resetRecurringRows = await sql`
        UPDATE tasks
        SET
          completed = false,
          "completedAt" = NULL,
          "isVisible" = true,
          deadline = CASE
            WHEN "interval" IS NOT NULL AND "interval" > 0
              THEN NOW() + ("interval" * INTERVAL '1 day')
            ELSE NULL
          END
        WHERE
          "isRecurring" = true
          AND deadline IS NOT NULL
          AND deadline <= NOW()
        RETURNING id
      `;

      // Reschedule notifications for reset recurring tasks
      for (const row of resetRecurringRows) {
          const tasks = await sql`SELECT * FROM tasks WHERE id = ${row.id}`;
          if (tasks.length > 0 && tasks[0].notifyEnabled) {
              await scheduleTaskNotification(tasks[0]);
          }
      }

      return res.json({
        success: true,
        updatesPerformed: hiddenRows.length + resetRecurringRows.length,
        hiddenCount: hiddenRows.length,
        recurringResetCount: resetRecurringRows.length,
      });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  } catch (err) {
    logDbError(err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
