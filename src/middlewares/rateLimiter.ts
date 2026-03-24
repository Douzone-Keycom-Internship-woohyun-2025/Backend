import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { AuthRequest } from "../types/auth";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: "fail",
    message: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "fail",
    message: "요청이 너무 많습니다.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// KIPRIS API 호출 엔드포인트용 — 유저 단위 일일 한도
// requireAuth 이후에 적용해야 req.user 접근 가능
const DEMO_EMAIL = "demo2@techlens.kr";
const DEMO_DAILY_LIMIT = 30;
const USER_DAILY_LIMIT = 200;

export const kiprisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: (req: Request) => {
    const { user } = req as AuthRequest;
    return user?.email === DEMO_EMAIL ? DEMO_DAILY_LIMIT : USER_DAILY_LIMIT;
  },
  keyGenerator: (req: Request) => {
    const { user } = req as AuthRequest;
    return user ? `kipris:user:${user.userId}` : `kipris:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    const { user } = req as AuthRequest;
    const isDemo = user?.email === DEMO_EMAIL;
    res.status(429).json({
      status: "fail",
      message: isDemo
        ? `데모 계정은 하루 ${DEMO_DAILY_LIMIT}회까지 조회할 수 있습니다. 내일 다시 이용해주세요.`
        : `하루 ${USER_DAILY_LIMIT}회 조회 한도에 도달했습니다. 내일 다시 이용해주세요.`,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
