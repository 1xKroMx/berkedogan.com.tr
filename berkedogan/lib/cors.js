const DEFAULT_ORIGIN = 'https://www.berkedogan.com.tr';

const parseAllowedOrigins = () => {
  const env = process.env.CORS_ALLOW_ORIGINS;
  if (!env) return [];
  return env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const defaultAllowedOrigins = () => {
  return [
    DEFAULT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
};

export function setCors(req, res) {
  const requestOrigin = req.headers?.origin;

  const allowList = [
    ...defaultAllowedOrigins(),
    ...parseAllowedOrigins(),
  ];

  const originToAllow = requestOrigin && allowList.includes(requestOrigin)
    ? requestOrigin
    : DEFAULT_ORIGIN;

  res.setHeader('Access-Control-Allow-Origin', originToAllow);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Needed when varying by Origin.
  res.setHeader('Vary', 'Origin');
}
