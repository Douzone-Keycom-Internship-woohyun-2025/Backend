import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
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

  // ZodError 처리 (400)
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: err.issues.map((i) => i.message).join(", "),
    });
  }

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

  // 일반적인 서버 오류 (500)
  return res.status(500).json({
    status: "error",
    message: "서버 오류",
  });
}
