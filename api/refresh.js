import { parse } from "cookie";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const cookies = parse(req.headers.cookie || '');
  const sessionId = cookies.sessionId;
  const authToken = cookies.authToken;

  // Both sessionId and token must exist
  if (!sessionId || !authToken) {
    return res.status(401).json({ success: false, error: "No session or token" });
  }

  // Verify JWT token
  try {
    const decoded = jwt.verify(authToken, JWT_SECRET);
    if (decoded.sessionId !== sessionId) {
      return res.status(401).json({ success: false, error: "Token mismatch" });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid token", details: err.message });
  }
}
