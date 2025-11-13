import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { PresetService } from "../services/presetService";
import { SummaryService } from "../services/summaryService";
import { NotFoundError } from "../errors/notFoundError";

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

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
  } catch (e: unknown) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ status: "fail", message: e.message });
    }
    console.error("요약 분석 에러:", e);
    return res
      .status(500)
      .json({ status: "error", message: "요약 분석 중 서버 오류" });
  }
};
