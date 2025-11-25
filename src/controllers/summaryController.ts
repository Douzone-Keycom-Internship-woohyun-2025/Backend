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

    /** 📌 Preset 모드 */
    if (presetId) {
      const preset = await PresetService.get(userId, presetId);
      applicant = preset.applicant;
      startDate = preset.start_date;
      endDate = preset.end_date;
    } else {

    /** 📌 Query 모드 */
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

    /** 요약 분석 */
    const summary = await SummaryService.analyze({
      applicant,
      startDate,
      endDate,
    });

    /** ================================
     *  🚨 프론트 타입에 맞춰 변환
     *  ================================ */

    const responseData = {
      applicant,
      period: { startDate, endDate },

      /** 📌 통계 */
      statistics: {
        totalPatents: summary.totalCount,
        monthlyAverage: summary.avgMonthlyCount,
        registrationRate: summary.statusPercent["등록"] ?? 0,
      },

      /** 📌 IPC 분포 (프론트 naming 맞춤) */
      ipcDistribution: summary.topIPC.map((x) => ({
        ipcCode: x.code,
        ipcKorName: x.korName,
        count: x.count,
      })),

      /** 📌 상태 분포 */
      statusDistribution: Object.entries(summary.statusCount).map(
        ([status, count]) => ({
          status,
          count,
        })
      ),

      /** 월별 */
      monthlyTrend: summary.monthlyTrend,

      /** 최근 특허 */
      recentPatents: summary.recentPatents,
    };

    return res.json({
      status: "success",
      message: "요약 분석 완료",
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};
