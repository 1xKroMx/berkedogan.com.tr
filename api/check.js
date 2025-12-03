import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

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

  const ok = bcrypt.compareSync(password, storedHash);

  if (!ok) return res.status(401).json({ success: false });

  const accessToken = jwt.sign(
    { authorized: true },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { authorized: true },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  res.setHeader('Set-Cookie', [
    serialize('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    }),
    serialize('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })
  ]);

  return res.json({ 
    success: true
  });
}
