import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { PatentService } from "../services/patentService";

export const basicSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { applicant, startDate, endDate, page = 1 } = req.body;

    const data = await PatentService.basicSearch({
      applicant,
      startDate,
      endDate,
      page,
    });

    return res.json({
      status: "success",
      message: "특허 검색 성공",
      data,
    });
  } catch (e) {
    console.error("기본 검색 오류:", e);
    return res.status(500).json({ status: "error", message: "검색 실패" });
  }
};

export const advancedSearch = async (req: AuthRequest, res: Response) => {
  try {
    const data = await PatentService.advancedSearch(req.body);

    return res.json({
      status: "success",
      message: "특허 검색 성공",
      data,
    });
  } catch (e) {
    console.error("상세 검색 오류:", e);
    return res.status(500).json({ status: "error", message: "검색 실패" });
  }
};

export const getPatentDetail = async (req: AuthRequest, res: Response) => {
  try {
    const applicationNumber = req.params.applicationNumber;

    const data = await PatentService.getDetail(applicationNumber);

    return res.json({
      status: "success",
      message: "특허 상세 조회 성공",
      data,
    });
  } catch (e) {
    console.error("상세 조회 오류:", e);
    return res.status(500).json({ status: "error", message: "조회 실패" });
  }
};
