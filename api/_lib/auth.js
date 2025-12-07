import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret";

export function verifyToken(req) {
  let token;

  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(' ')[1];
  }

  // If no header, try cookies
  if (!token && req.headers.cookie) {
    const cookies = parse(req.headers.cookie);
    token = cookies.authToken;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function withAuth(handler) {
  return async (req, res) => {
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or missing token'
      });
    }
    req.user = user;
    return handler(req, res);
  };
}
