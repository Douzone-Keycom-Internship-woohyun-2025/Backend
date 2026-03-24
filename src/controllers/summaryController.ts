import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { PresetService } from "../services/presetService";
import { SummaryService } from "../services/summaryService";

export const compareSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicantsRaw = String(req.query.applicants || "").trim();
    const startDate = String(req.query.startDate || "").trim();
    const endDate = String(req.query.endDate || "").trim();

    if (!applicantsRaw || !startDate || !endDate) {
      return res.status(400).json({
        status: "fail",
        message: "applicants, startDate, endDate 를 모두 입력해야 합니다.",
      });
    }

    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        status: "fail",
        message: "날짜는 YYYYMMDD 형식이어야 합니다.",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        status: "fail",
        message: "startDate가 endDate보다 늦을 수 없습니다.",
      });
    }

    const applicants = applicantsRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (applicants.length < 2 || applicants.length > 5) {
      return res.status(400).json({
        status: "fail",
        message: "비교 대상 회사는 2~5개여야 합니다.",
      });
    }

    const results = await SummaryService.compareAnalyze({
      applicants,
      startDate,
      endDate,
    });

    const comparisonData = results.map(({ applicant, result }) => ({
      applicant,
      period: { startDate, endDate },
      statistics: {
        totalPatents: result.totalCount,
        monthlyAverage: result.avgMonthlyCount,
        registrationRate: result.statusPercent["등록"] ?? 0,
      },
      ipcDistribution: result.topIPC.map((x) => ({
        ipcCode: x.code,
        ipcKorName: x.korName,
        count: x.count,
      })),
      statusDistribution: Object.entries(result.statusCount).map(
        ([status, count]) => ({ status, count })
      ),
      monthlyTrend: result.monthlyTrend,
      recentPatents: result.recentPatents,
    }));

    return res.json({
      status: "success",
      message: "비교 분석 완료",
      data: {
        period: { startDate, endDate },
        companies: comparisonData,
      },
    });
  } catch (err) {
    next(err);
  }
};

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

    const dateRegex = /^\d{8}$/;

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

      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          status: "fail",
          message: "날짜는 YYYYMMDD 형식이어야 합니다.",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          status: "fail",
          message: "startDate가 endDate보다 늦을 수 없습니다.",
        });
      }
    }

    /** 📌 RAW 요약 분석 */
    const summary = await SummaryService.analyze({
      applicant,
      startDate,
      endDate,
    });

    /** ==============================
     🔥 프론트 SummaryDashboard 타입 매핑
     =============================== */

    const responseData = {
      applicant,

      /** 기간 정보(프론트가 그대로 출력함) */
      period: { startDate, endDate },

      /** 상단 통계 카드 */
      statistics: {
        totalPatents: summary.totalCount,
        monthlyAverage: summary.avgMonthlyCount,
        registrationRate: summary.statusPercent["등록"] ?? 0,
      },

      /** IPC 파이차트 + Top5 리스트 */
      ipcDistribution: summary.topIPC.map((x) => ({
        ipcCode: x.code,
        ipcKorName: x.korName,
        count: x.count,
      })),

      /** 상태 분포 (도넛차트) */
      statusDistribution: Object.entries(summary.statusCount).map(
        ([status, count]) => ({
          status,
          count,
        })
      ),

      /** 월별 출원 추이 */
      monthlyTrend: summary.monthlyTrend,

      /** 최근 3개 특허 카드 */
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
