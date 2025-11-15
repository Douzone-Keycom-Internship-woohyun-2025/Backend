import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { PatentService } from "../services/patentService";

export const basicSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
  } catch (err) {
    next(err);
  }
};

export const advancedSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      applicant,
      inventionTitle,
      registerStatus,
      startDate,
      endDate,
      page,
    } = req.body;

    const data = await PatentService.advancedSearch({
      applicant,
      inventionTitle,
      registerStatus,
      startDate,
      endDate,
      page,
    });

    return res.json({
      status: "success",
      message: "특허 검색 성공",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getPatentDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationNumber = req.params.applicationNumber;
    const data = await PatentService.getDetail(applicationNumber);

    return res.json({
      status: "success",
      message: "특허 상세 조회 성공",
      data,
    });
  } catch (err) {
    next(err);
  }
};
