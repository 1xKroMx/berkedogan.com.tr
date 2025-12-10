import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";
import { parse } from "cookie";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    const rows = await sql`
      SELECT id, title, completed, "isRecurring", "interval", deadline FROM tasks WHERE "isVisible" = true ORDER BY id ASC
    `;

    return res.json({
      success: true,
      tasks: rows,
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
