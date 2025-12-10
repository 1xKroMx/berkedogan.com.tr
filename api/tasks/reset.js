import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";
import { parse } from "cookie";

const sql = neon(process.env.DATABASE_URL);

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

  try {
    // Get today's date in Turkey timezone (YYYY-MM-DD)
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

    // Get last reset date
    const result = await sql`
      SELECT value FROM system_state WHERE key = 'last_reset'
    `;

    const lastReset = result.length > 0 ? result[0].value : null;

    if (lastReset !== today) {
      // Perform reset
      await sql`UPDATE tasks SET completed = false`;
      
      // Update last_reset
      await sql`
        INSERT INTO system_state (key, value)
        VALUES ('last_reset', ${today})
        ON CONFLICT (key) DO UPDATE SET value = ${today}
      `;

      return res.json({ success: true, resetPerformed: true, date: today });
    }

    return res.json({ success: true, resetPerformed: false, date: today });

  } catch (err) {
    console.error("Reset Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
