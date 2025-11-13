import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthRequest } from "../types/request";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.signup(email, password);
    return res.status(201).json({
      status: "success",
      message: "회원가입 성공",
      data: result,
    });
  } catch (e: unknown) {
    console.error("회원가입 에러:", e);
    if (e instanceof Error) {
      return res.status(400).json({
        status: "fail",
        message: e.message || "등록 실패",
      });
    }
    return res.status(400).json({
      status: "fail",
      message: "등록 실패",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return res.json({
      status: "success",
      message: "로그인 성공",
      data: result,
    });
  } catch (e: unknown) {
    console.error("로그인 에러:", e);
    if (e instanceof Error) {
      return res.status(401).json({
        status: "fail",
        message: e.message || "로그인 실패",
      });
    }
    return res.status(401).json({
      status: "fail",
      message: "로그인 실패",
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.token;
    if (token) {
      await AuthService.logout(token);
    }
    return res.json({
      status: "success",
      message: "로그아웃 완료",
    });
  } catch (e: unknown) {
    console.error("로그아웃 에러:", e);
    if (e instanceof Error) {
      return res.status(500).json({
        status: "error",
        message: e.message || "로그아웃 처리 중 오류가 발생했습니다.",
      });
    }
    return res.status(500).json({
      status: "error",
      message: "로그아웃 처리 중 오류가 발생했습니다.",
    });
  }
};
