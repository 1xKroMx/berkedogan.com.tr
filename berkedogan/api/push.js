import jwt from "jsonwebtoken";
import { parse } from "cookie";
import webpush from "web-push";

import { getSql, logDbError } from "../lib/db.js";
import { setCors } from "../lib/cors.js";

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret";

function requireVapidEnv() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@berkedogan.com.tr";
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey, subject };
}

function verifyAuth(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) {
    res.status(401).json({ success: false, error: "Missing token" });
    return false;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
    return false;
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const action = req.query?.action;

  // Cron jobs (checking notifications) don't have cookies, so we bypass auth for them.
  // In a real env, verify CRON_SECRET header if needed.
  if (action !== "notify" && action !== "trigger-task") {
    if (!verifyAuth(req, res)) return;
  }

  try {
    if (req.method === "POST" && action === "trigger-task") {
        requireVapidEnv();
        const { taskId } = req.body;
        
        if (!taskId) return res.status(400).json({success: false, error: "Missing taskId"});
        
        const sql = getSql();
        
        // Fetch task
        const tasks = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
        if (tasks.length === 0) return res.json({success: true, skipped: "Task not found"});
        
        const task = tasks[0];
        if (task.completed || !task.notifyEnabled) return res.json({success: true, skipped: "Task completed or disabled"});
        
        // Fetch subscriptions
        const subs = await sql`
          SELECT id, subscription
          FROM push_subscriptions
          WHERE "isActive" = true
        `;

        if (subs.length === 0) return res.json({ success: true, warning: "No subscriptions" });

        const payload = JSON.stringify({
          title: task.title,
          body: "Hatırlatma zamanı!",
          icon: "/android-chrome-192x192.png",
          data: { url: "/panel/tasks" },
        });

        // Send
        await Promise.all(
          subs.map(async (s) => {
            try {
              await webpush.sendNotification(s.subscription, payload);
            } catch (err) {
               if (err.statusCode === 410 || err.statusCode === 404) {
                 await sql`UPDATE push_subscriptions SET "isActive" = false WHERE id = ${s.id}`;
               }
            }
          })
        );
        
        // Important: Should we reschedule for tomorrow if it's recurring?
        // No, `scheduleTaskNotification` only sets "next occurrence".
        // The message is consumed now.
        // If the task is recurring, the user is expected to mark it complete, then reset handles it.
        // OR they don't mark it complete, and want reminding again?
        // Usually reminders are one-offs per interval.
        // However, we should probably clear the `qstashMessageId` since it's used.
        await sql`UPDATE tasks SET "qstashMessageId" = NULL WHERE id = ${task.id}`;

        return res.json({ success: true });
    }

    if (req.method === "GET" && action === "notify") {
      requireVapidEnv();
      const sql = getSql();

      // Current time in Istanbul (where the user likely is)
      // Use en-GB to get HH:mm format (Turkey uses dots normally, but input type="time" is colons)
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
      });

      const tasks = await sql`
        SELECT id, title
        FROM tasks
        WHERE
          "completed" = false AND
          "notifyEnabled" = true AND
          "notifyTime" = ${timeString}
      `;

      if (tasks.length === 0) {
        return res.json({ success: true, count: 0 });
      }

      const subs = await sql`
        SELECT id, subscription
        FROM push_subscriptions
        WHERE "isActive" = true
      `;

      if (subs.length === 0) {
        return res.json({ success: true, warning: "No subscriptions" });
      }

      let sentCount = 0;
      for (const t of tasks) {
        const payload = JSON.stringify({
          title: t.title,
          body: "Hatırlatma zamanı!",
          icon: "/android-chrome-192x192.png",
          data: { url: "/panel/tasks" },
        });

        await Promise.all(
          subs.map(async (s) => {
            try {
              await webpush.sendNotification(s.subscription, payload);
            } catch (err) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                await sql`
                  UPDATE push_subscriptions
                  SET "isActive" = false, "updatedAt" = NOW()
                  WHERE id = ${s.id}
                `;
              }
            }
          })
        );
        sentCount++;
      }

      return res.json({ success: true, sent: sentCount });
    }

    if (req.method === "GET" && action === "key") {
      const env = requireVapidEnv();
      return res.json({ success: true, key: env.publicKey });
    }

    if (req.method === "POST" && action === "subscribe") {
      const { subscription } = req.body || {};
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ success: false, error: "Missing subscription" });
      }

      const keys = subscription.keys || {};
      const expirationTime = subscription.expirationTime
        ? new Date(subscription.expirationTime).toISOString()
        : null;

      const sql = getSql();
      const rows = await sql`
        INSERT INTO push_subscriptions (
          endpoint,
          subscription,
          "p256dh",
          "auth",
          "expirationTime",
          "isActive"
        )
        VALUES (
          ${subscription.endpoint},
          ${subscription},
          ${keys.p256dh || null},
          ${keys.auth || null},
          ${expirationTime},
          true
        )
        ON CONFLICT (endpoint)
        DO UPDATE SET
          subscription = EXCLUDED.subscription,
          "p256dh" = EXCLUDED."p256dh",
          "auth" = EXCLUDED."auth",
          "expirationTime" = EXCLUDED."expirationTime",
          "isActive" = true,
          "updatedAt" = NOW()
        RETURNING id
      `;

      return res.json({ success: true, id: rows[0]?.id });
    }

    if (req.method === "POST" && action === "test") {
      requireVapidEnv();
      const sql = getSql();
      const rows = await sql`
        SELECT id, endpoint, subscription
        FROM push_subscriptions
        WHERE "isActive" = true
        ORDER BY "updatedAt" DESC
        LIMIT 1
      `;

      const target = rows[0];
      if (!target) {
        return res.status(404).json({ success: false, error: "No active subscription" });
      }

      const payload = {
        title: req.body?.title || "Hatırlatma",
        body: req.body?.body || "Test bildirimi",
        data: { url: req.body?.url || "/panel/tasks" },
      };

      try {
        await webpush.sendNotification(target.subscription, JSON.stringify(payload));
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await sql`
            UPDATE push_subscriptions
            SET "isActive" = false, "updatedAt" = NOW()
            WHERE id = ${target.id}
          `;
        }
        throw err;
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err) {
    logDbError(err);
    const msg = err?.message || "Server error";
    return res.status(500).json({ success: false, error: msg });
  }
}
