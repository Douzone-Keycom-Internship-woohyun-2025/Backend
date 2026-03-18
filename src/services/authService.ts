import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/authRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { JWT_SECRET } from "../config/env";
import { BadRequestError } from "../errors/badRequestError";
import { UnauthorizedError } from "../errors/unauthorizedError";

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7일

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

function generateAccessToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

export const AuthService = {
  async signup(email: string, password: string) {
    email = normalizeEmail(email);

    if (password.length < 8) {
      throw new BadRequestError("비밀번호는 최소 8자 이상");
    }

    const exists = await UserRepository.findByEmail(email);
    if (exists) {
      throw new BadRequestError("이미 가입된 이메일입니다.");
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserRepository.create(email, hashed);

    const accessToken = generateAccessToken({
      email,
      userId: user.user_tblkey,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    await RefreshTokenRepository.deleteByEmail(email);
    await RefreshTokenRepository.save(refreshToken, email, expiresAt);

    const { password_hash: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    email = normalizeEmail(email);

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("이메일 또는 비밀번호 오류");
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new UnauthorizedError("이메일 또는 비밀번호 오류");
    }

    const accessToken = generateAccessToken({
      email,
      userId: user.user_tblkey,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    await RefreshTokenRepository.deleteByEmail(email);
    await RefreshTokenRepository.save(refreshToken, email, expiresAt);

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    const stored = await RefreshTokenRepository.find(refreshToken);
    if (!stored) {
      throw new UnauthorizedError("refresh token invalid");
    }

    // 기존 토큰 삭제 (rotation)
    await RefreshTokenRepository.delete(refreshToken);

    const user = await UserRepository.findByEmail(stored.email);
    if (!user) {
      throw new UnauthorizedError("사용자를 찾을 수 없습니다.");
    }

    // 새 토큰 쌍 발급
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
    await RefreshTokenRepository.save(newRefreshToken, stored.email, expiresAt);

    const accessToken = generateAccessToken({
      email: stored.email,
      userId: user.user_tblkey,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    await RefreshTokenRepository.delete(refreshToken);
  },
};
