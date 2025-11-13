import { Response } from "express";
import { AuthRequest } from "../types/request";
import { PresetService } from "../services/presetService";
import {
  createPresetSchema,
  updatePresetSchema,
} from "../validators/presetSchemas";

export const createPreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ status: "fail", message: "인증 필요" });

    const body = createPresetSchema.parse(req.body);
    const row = await PresetService.create(userId, body);

    return res.status(201).json({
      status: "success",
      message: "프리셋이 생성되었습니다.",
      data: {
        id: row.preset_tblkey,
        presetName: row.preset_name,
        applicant: row.applicant,
        startDate: row.start_date,
        endDate: row.end_date,
        description: row.description,
        createdAt: row.adddate,
      },
    });
  } catch (e: unknown) {
    console.error("프리셋 생성 에러:", e);
    if (e instanceof Error) {
      return res.status(500).json({
        status: "error",
        message: e.message || "서버 오류",
      });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const listPresets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ status: "fail", message: "인증 필요" });

    const skip = Number(req.query.skip ?? 0);
    const limit = Number(req.query.limit ?? 10);
    const { rows, total } = await PresetService.list(userId, skip, limit);

    return res.json({
      status: "success",
      message: "프리셋 목록 조회 성공",
      data: {
        total,
        page: Math.floor(skip / Math.max(1, limit)) + 1,
        pageSize: limit,
        presets: rows.map((r) => ({
          id: r.preset_tblkey,
          presetName: r.preset_name,
          applicant: r.applicant,
          startDate: r.start_date,
          endDate: r.end_date,
          createdAt: r.adddate,
        })),
      },
    });
  } catch (e: unknown) {
    console.error("프리셋 목록 조회 에러:", e);
    if (e instanceof Error) {
      return res.status(500).json({
        status: "error",
        message: e.message || "서버 오류",
      });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const getPreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ status: "fail", message: "인증 필요" });

    const presetId = Number(req.params.presetId);
    const r = await PresetService.get(userId, presetId);

    return res.json({
      status: "success",
      data: {
        id: r.preset_tblkey,
        presetName: r.preset_name,
        applicant: r.applicant,
        startDate: r.start_date,
        endDate: r.end_date,
        description: r.description,
        createdAt: r.adddate,
      },
    });
  } catch (e: unknown) {
    console.error("프리셋 조회 에러:", e);
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ status: "fail", message: "리소스를 찾을 수 없음" });
    }
    if (e instanceof Error) {
      return res.status(500).json({
        status: "error",
        message: e.message || "서버 오류",
      });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const updatePreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ status: "fail", message: "인증 필요" });

    const presetId = Number(req.params.presetId);
    const patch = updatePresetSchema.parse(req.body);

    await PresetService.update(userId, presetId, patch);
    return res.json({ status: "success", message: "프리셋이 수정되었습니다." });
  } catch (e: unknown) {
    console.error("프리셋 수정 에러:", e);
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ status: "fail", message: "리소스를 찾을 수 없음" });
    }
    if (e instanceof Error) {
      return res.status(500).json({
        status: "error",
        message: e.message || "서버 오류",
      });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const deletePreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const presetId = Number(req.params.presetId);
    await PresetService.remove(userId, presetId);

    return res.status(204).end();
  } catch (e: unknown) {
    console.error("프리셋 삭제 에러:", e);
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return res
        .status(404)
        .json({ status: "fail", message: "리소스를 찾을 수 없음" });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};
