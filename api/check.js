import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

// In-memory session store (max 1000 concurrent sessions)
const sessions = new Map();
const MAX_SESSIONS = 1000;
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret";

function createSession() {
  // Clean expired sessions
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }

  // Limit to MAX_SESSIONS
  if (sessions.size >= MAX_SESSIONS) {
    const oldestId = Array.from(sessions.entries())
      .sort(([, a], [, b]) => a.expiresAt - b.expiresAt)[0][0];
    sessions.delete(oldestId);
  }

  const sessionId = randomUUID();
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  
  sessions.set(sessionId, {
    createdAt: Date.now(),
    expiresAt,
    authenticated: true
  });

  // Generate JWT token
  const token = jwt.sign(
    { sessionId, authenticated: true },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { sessionId, token };
}

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

  const { password } = req.body;
  const storedHash = process.env.VERCEL_PASSWORD_HASH;

  if (!storedHash) {
    return res.status(500).json({ success: false, error: "Missing hash" });
  }

  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ success: false, error: "Missing password" });
  }

  const ok = bcrypt.compareSync(password, storedHash);

  if (!ok) {
    return res.status(401).json({ success: false, error: "Invalid password" });
  }

  // Create session with JWT
  const { sessionId, token } = createSession();

  // Set both sessionId and token as separate secure cookies
  res.setHeader('Set-Cookie', [
    serialize('sessionId', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: '/'
    }),
    serialize('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000,
      path: '/'
    })
  ]);

  return res.json({ success: true });
}
