import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { PresetService } from "../services/presetService";
import { SummaryService } from "../services/summaryService";

export const getSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const presetId = req.query.presetId ? Number(req.query.presetId) : null;

    let applicant: string;
    let startDate: string;
    let endDate: string;

    if (presetId) {
      const preset = await PresetService.get(userId, presetId);
      applicant = preset.applicant;
      startDate = preset.start_date;
      endDate = preset.end_date;
    } else {
      applicant = String(req.query.applicant || "").trim();
      startDate = String(req.query.startDate || "").trim();
      endDate = String(req.query.endDate || "").trim();

      if (!applicant || !startDate || !endDate) {
        return res.status(400).json({
          status: "fail",
          message:
            "presetId 또는 applicant + startDate + endDate 를 모두 입력해야 합니다.",
        });
      }
    }

    const summary = await SummaryService.analyze({
      applicant,
      startDate,
      endDate,
    });

    return res.json({
      status: "success",
      message: "요약 분석 완료",
      data: {
        applicant,
        period: { startDate, endDate },
        ...summary,
      },
    });
  } catch (err) {
    next(err);
  }
};
