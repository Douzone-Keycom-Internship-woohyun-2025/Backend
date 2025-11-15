import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.signup(email, password);
    return res.status(201).json({
      status: "success",
      message: "회원가입 성공",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return res.json({
      status: "success",
      message: "로그인 성공",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (err) {
    next(err);
  }
};
