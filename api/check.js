import * as bcrypt from "bcryptjs";

export default async function handler(req, res) {
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
    console.error("Hash env variable missing!");
    return res.status(500).json({ success: false, error: "Server config error" });
  }

  const ok = await bcrypt.compare(password, storedHash);

  if (!ok) return res.status(401).json({ success: false });

  return res.json({ success: true });
}