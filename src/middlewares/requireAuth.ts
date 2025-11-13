import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthPayload {
  email: string;
}

export function getBearerToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  const [scheme, token] = h.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getBearerToken(req);
    if (!token)
      return res.status(401).json({ status: "fail", message: "토큰 없음" });

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    req.user = { email: decoded.email };
    next();
  } catch (e) {
    return res.status(401).json({
      status: "fail",
      message: "유효하지 않은 토큰",
    });
  }
}
