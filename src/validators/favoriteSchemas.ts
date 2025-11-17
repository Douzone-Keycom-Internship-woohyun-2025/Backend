import { z } from "zod";

export const createFavoriteSchema = z.object({
  applicationNumber: z
    .string()
    .min(1, "출원번호는 필수입니다")
    .regex(/^\d+$/, "출원번호는 숫자만 입력 가능합니다"),

  inventionTitle: z
    .string()
    .min(1, "발명의 명칭은 필수입니다")
    .max(500, "발명의 명칭은 500자 이하여야 합니다"),

  applicantName: z
    .string()
    .min(1, "출원인명은 필수입니다")
    .max(200, "출원인명은 200자 이하여야 합니다"),

  applicationDate: z
    .string()
    .regex(/^\d{8}$/, "출원일은 YYYYMMDD 형식이어야 합니다 (예: 20240103)"),

  abstract: z.string().max(5000).optional().or(z.literal("")),
  openNumber: z.string().optional().or(z.literal("")),
  publicationNumber: z.string().optional().or(z.literal("")),
  publicationDate: z.string().optional().or(z.literal("")),
  registerNumber: z.string().optional().or(z.literal("")),
  registerDate: z.string().optional().or(z.literal("")),
  registerStatus: z.string().optional().or(z.literal("")),
  drawingUrl: z.string().optional().or(z.literal("")),
});
