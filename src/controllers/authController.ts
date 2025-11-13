import { Request, Response } from "express";
import { AuthService } from "../services/authService";

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
    return res.status(400).json({
      status: "fail",
      message: e instanceof Error ? e.message : "등록 실패",
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
    return res.status(401).json({
      status: "fail",
      message: e instanceof Error ? e.message : "로그인 실패",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "fail",
        message: "refreshToken 필요",
      });
    }

    const result = await AuthService.refresh(refreshToken);

    return res.json({
      status: "success",
      message: "토큰 재발급 성공",
      data: result,
    });
  } catch (e: unknown) {
    return res.status(401).json({
      status: "fail",
      message: "refresh token invalid",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "fail",
        message: "refreshToken 필요",
      });
    }

    await AuthService.logout(refreshToken);

    return res.json({
      status: "success",
      message: "로그아웃 완료",
    });
  } catch (e: unknown) {
    return res.status(500).json({
      status: "error",
      message: "로그아웃 처리 중 오류 발생",
    });
  }
};
