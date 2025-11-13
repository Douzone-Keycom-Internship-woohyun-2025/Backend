import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtBlacklistRepository } from "../repositories/jwtBlacklistRepository";
import { AuthRequest } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET 누락");

export interface AuthPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
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
    if (Math.random() < 0.01) {
      JwtBlacklistRepository.purgeExpired()
        .then(() => console.log("만료된 토큰 정리 완료"))
        .catch((err: unknown) => {
          console.error("정리 에러:", err);
        });
    }

    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "토큰이 없습니다.",
      });
    }

    if (await JwtBlacklistRepository.isBlacklisted(token)) {
      return res.status(401).json({
        status: "fail",
        message: "로그아웃된 토큰입니다.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    req.token = token;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "fail",
          message: "토큰이 만료되었습니다.",
        });
      }
      if (e.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: "fail",
          message: "유효하지 않은 토큰입니다.",
        });
      }
    }
    console.error("인증 에러:", e);
    return res.status(500).json({
      status: "error",
      message: "서버 오류가 발생했습니다.",
    });
  }
}
