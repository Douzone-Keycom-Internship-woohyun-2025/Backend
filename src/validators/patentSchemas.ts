import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{8}$/, "날짜는 YYYYMMDD 형식이어야 합니다")
  .optional();

export const basicSearchSchema = z.object({
  applicant: z.string().min(1, "회사명을 입력하세요").max(200),
  startDate: dateSchema,
  endDate: dateSchema,
  page: z.number().int().min(1).max(1000).default(1),
  sort: z.enum(["asc", "desc"]).default("desc"),
});

export const advancedSearchSchema = basicSearchSchema
  .extend({
    applicant: z.string().min(1).max(200).optional(),
    inventionTitle: z.string().max(500).optional(),
    registerStatus: z
      .enum(["공개", "취하", "소멸", "포기", "무효", "거절", "등록"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      data.applicant || data.inventionTitle || data.registerStatus || data.startDate || data.endDate;
    if (!hasAny) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "검색 조건을 하나 이상 입력하세요",
        path: ["applicant"],
      });
    }
  });
