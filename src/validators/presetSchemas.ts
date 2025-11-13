import { z } from "zod";

export const createPresetSchema = z
  .object({
    presetName: z.string().min(1).max(255),
    applicant: z.string().min(1).max(255),
    startDate: z.string().regex(/^\d{8}$/),
    endDate: z.string().regex(/^\d{8}$/),
    description: z.string().max(500).optional(),
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: "startDate가 endDate보다 늦을 수 없습니다.",
    path: ["endDate"],
  });

export const updatePresetSchema = createPresetSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "수정할 필드가 없습니다.",
  });
