import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자")
    .max(72, "비밀번호는 최대 72자"),
});

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z
    .string()
    .min(1, "비밀번호를 입력하세요")
    .max(72, "비밀번호는 최대 72자"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "토큰이 필요합니다"),
});
