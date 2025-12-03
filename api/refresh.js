import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";

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
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: "No refresh token" });
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { authorized: true },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.setHeader('Set-Cookie', serialize('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    }));

    return res.json({ 
      success: true
    });

  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
}
