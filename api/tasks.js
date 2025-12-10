import jwt from "jsonwebtoken";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Missing token" });
  }

  const token = auth.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }

  try {
    const { rows } = await pool.query("SELECT id, title, completed FROM tasks ORDER BY id ASC");

    return res.json({
      success: true,
      tasks: rows,
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
