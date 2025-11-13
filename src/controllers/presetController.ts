import { Response } from "express";
import { AuthRequest } from "../types/request";
import { PresetService } from "../services/presetService";
import { NotFoundError } from "../errors/notFoundError";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

export const createPreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const row = await PresetService.create(userId, req.body);

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
      return res
        .status(500)
        .json({ status: "error", message: e.message || "서버 오류" });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const listPresets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const rawSkip = Number(req.query.skip ?? 0);
    const rawLimit = Number(req.query.limit ?? 10);
    const skip =
      Number.isFinite(rawSkip) && rawSkip > 0 ? Math.floor(rawSkip) : 0;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 100)
        : 10;

    const { rows, total } = await PresetService.list(userId, skip, limit);
    const page = Math.floor(skip / Math.max(1, limit)) + 1;
    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

    return res.json({
      status: "success",
      message: "프리셋 목록 조회 성공",
      data: {
        total,
        page,
        pageSize: limit,
        totalPages,
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
      return res
        .status(500)
        .json({ status: "error", message: e.message || "서버 오류" });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const getPreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const presetId = parseId(req.params.presetId);
    if (!presetId) {
      return res.status(400).json({ status: "fail", message: "잘못된 ID" });
    }

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
    if (e instanceof NotFoundError) {
      return res.status(404).json({ status: "fail", message: e.message });
    }
    if (e instanceof Error) {
      return res
        .status(500)
        .json({ status: "error", message: e.message || "서버 오류" });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};

export const updatePreset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "인증 필요" });
    }

    const presetId = parseId(req.params.presetId);
    if (!presetId) {
      return res.status(400).json({ status: "fail", message: "잘못된 ID" });
    }

    await PresetService.update(userId, presetId, req.body);
    return res.json({ status: "success", message: "프리셋이 수정되었습니다." });
  } catch (e: unknown) {
    console.error("프리셋 수정 에러:", e);
    if (e instanceof NotFoundError) {
      return res.status(404).json({ status: "fail", message: e.message });
    }
    if (e instanceof Error) {
      return res
        .status(500)
        .json({ status: "error", message: e.message || "서버 오류" });
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

    const presetId = parseId(req.params.presetId);
    if (!presetId) {
      return res.status(400).json({ status: "fail", message: "잘못된 ID" });
    }

    await PresetService.remove(userId, presetId);

    return res.status(204).end();
  } catch (e: unknown) {
    console.error("프리셋 삭제 에러:", e);
    if (e instanceof NotFoundError) {
      return res.status(404).json({ status: "fail", message: e.message });
    }
    if (e instanceof Error) {
      return res
        .status(500)
        .json({ status: "error", message: e.message || "서버 오류" });
    }
    return res.status(500).json({ status: "error", message: "서버 오류" });
  }
};
