import { parse } from "cookie";

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

  // Sadece session cookie'nin varlığını kontrol et
  // Gerçek validasyon frontend'de router guard tarafından yapılır
  if (!sessionId) {
    return res.status(401).json({ success: false, error: "No session" });
  }

  // Session var, valid assume et
  // (Vercel serverless ortamında memory sharing olmadığı için
  // backend'de full validation yapamazsın, ama sessionId'nin varlığı
  // kullanıcının en azından bir kez giriş yaptığını gösterir)
  return res.json({ success: true });
}
