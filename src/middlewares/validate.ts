import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (result.success) {
        req.body = result.data;
        return next();
      }

      const issues = result.error.issues.map((e) => ({
        path: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
        message: e.message,
      }));

      return res.status(400).json({
        status: "fail",
        message: "유효성 오류",
        issues,
      });
    } catch (e: unknown) {
      console.error("유효성 검사 에러:", e);
      return res.status(400).json({
        status: "fail",
        message: "유효성 검사 중 오류가 발생했습니다.",
      });
    }
  };
}
