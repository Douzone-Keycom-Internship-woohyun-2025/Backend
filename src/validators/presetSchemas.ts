import { z } from "zod";

const basePresetSchema = z.object({
  presetName: z.string().min(1).max(255),
  applicant: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{8}$/),
  endDate: z.string().regex(/^\d{8}$/),
  description: z.string().max(500).optional(),
});

export const createPresetSchema = basePresetSchema.refine(
  ({ startDate, endDate }) => startDate <= endDate,
  {
    message: "startDate가 endDate보다 늦을 수 없습니다.",
    path: ["endDate"],
  }
);

export const updatePresetSchema = basePresetSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "수정할 필드가 없습니다.",
  })
  .refine(
    ({ startDate, endDate }) => {
      if (startDate !== undefined && endDate !== undefined) {
        return startDate <= endDate;
      }
      return true;
    },
    {
      message: "startDate가 endDate보다 늦을 수 없습니다.",
      path: ["endDate"],
    }
  );
