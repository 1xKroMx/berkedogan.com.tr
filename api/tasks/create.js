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

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: "Missing title" });
  }

  try {
    const rows = await sql`
      INSERT INTO tasks (title, completed)
      VALUES (${title}, false)
      RETURNING id, title, completed
    `;

    return res.json({
      success: true,
      task: rows[0],
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
