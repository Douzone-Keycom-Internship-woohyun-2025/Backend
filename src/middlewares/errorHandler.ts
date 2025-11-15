import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/notFoundError";
import { BadRequestError } from "../errors/badRequestError";
import { UnauthorizedError } from "../errors/unauthorizedError";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  // BadRequestError 처리 (400)
  if (err instanceof BadRequestError) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }

  // UnauthorizedError 처리 (401)
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }

  // NotFoundError 처리 (404)
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }

  // JWT 토큰 만료 에러 처리 (401)
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "토큰 만료됨",
    });
  }

  // JWT 유효하지 않은 토큰 에러 처리 (401)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "유효하지 않은 토큰",
    });
  }

  // 일반적인 서버 오류 (500)
  return res.status(500).json({
    status: "error",
    message: "서버 오류",
  });
}
