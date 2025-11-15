import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/authRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { JWT_SECRET } from "../config/env";

const SALT_ROUNDS = 12;

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

function generateAccessToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

function generateRefreshToken() {
  return jwt.sign({}, JWT_SECRET, { expiresIn: "7d" });
}

export const AuthService = {
  async signup(email: string, password: string) {
    email = normalizeEmail(email);

    if (password.length < 8) throw new Error("비밀번호는 최소 8자 이상");

    const exists = await UserRepository.findByEmail(email);
    if (exists) throw new Error("이미 가입된 이메일입니다.");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserRepository.create(email, hashed);

    const accessToken = generateAccessToken({
      email,
      userId: user.user_tblkey,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshTokenRepository.save(refreshToken, email, expiresAt);

    const { password_hash: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    email = normalizeEmail(email);

    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("이메일 또는 비밀번호 오류");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("이메일 또는 비밀번호 오류");

    const accessToken = generateAccessToken({
      email,
      userId: user.user_tblkey,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshTokenRepository.save(refreshToken, email, expiresAt);

    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    const stored = await RefreshTokenRepository.find(refreshToken);
    if (!stored) throw new Error("refresh token invalid");

    jwt.verify(refreshToken, JWT_SECRET);

    const email = stored.email;

    const accessToken = generateAccessToken({ email });

    return { accessToken };
  },

  async logout(refreshToken: string) {
    await RefreshTokenRepository.delete(refreshToken);
  },
};
