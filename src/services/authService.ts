import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { JwtBlacklistRepository } from "../repositories/jwtBlacklistRepository";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("환경변수 JWT_SECRET이 설정되어야 합니다.");
}

const SALT_ROUNDS = 12;
const normEmail = (e: string) => e.trim().toLowerCase();

export const AuthService = {
  async signup(email: string, password: string) {
    email = normEmail(email);
    if (!password || password.length < 8) {
      throw new Error("비밀번호는 최소 8자 이상이어야 합니다.");
    }

    const exists = await UserRepository.findByEmail(email);
    if (exists) throw new Error("이미 가입된 이메일입니다.");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserRepository.create(email, hashed);

    const token = jwt.sign(
      { userId: user.user_tblkey, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password_hash: _pw, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async login(email: string, password: string) {
    email = normEmail(email);

    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("이메일 또는 비밀번호를 확인해주세요.");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new Error("이메일 또는 비밀번호를 확인해주세요.");

    const token = jwt.sign(
      { userId: user.user_tblkey, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password_hash: _pw, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async logout(token: string): Promise<void> {
    let expSec: number | null = null;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      expSec = typeof decoded.exp === "number" ? decoded.exp : null;
    } catch (err) {
      return;
    }
    if (!expSec || expSec * 1000 <= Date.now()) {
      return;
    }
    const expiresAt = new Date(expSec * 1000);
    await JwtBlacklistRepository.add(token, expiresAt);
  },
};
