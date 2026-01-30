import jwt from "jsonwebtoken";
import { parse } from "cookie";

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

  if (!verifyAuth(req, res)) return;

  const action = req.query?.action;

  try {
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

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (err) {
    logDbError(err);
    const msg = err?.message || "Server error";
    return res.status(500).json({ success: false, error: msg });
  }
}
