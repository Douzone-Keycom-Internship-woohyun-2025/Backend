import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthRequest } from "../types/request";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.signup(email, password);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "등록 실패" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ message: e.message || "로그인 실패" });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.token;
    if (token) {
      await AuthService.logout(token);
    }
    return res.json({ message: "로그아웃 완료" });
  } catch (err) {
    console.error("로그아웃 에러:", err);
    return res
      .status(500)
      .json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
  }
};
