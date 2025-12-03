import bcrypt from "bcryptjs";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.berkedogan.com.tr");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

  return res.json({ success: true });
}
