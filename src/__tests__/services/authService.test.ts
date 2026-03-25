import bcrypt from "bcryptjs";
import { AuthService } from "../../services/authService";
import { UserRepository } from "../../repositories/authRepository";
import { RefreshTokenRepository } from "../../repositories/refreshTokenRepository";
import { BadRequestError } from "../../errors/badRequestError";
import { UnauthorizedError } from "../../errors/unauthorizedError";

jest.mock("../../repositories/authRepository");
jest.mock("../../repositories/refreshTokenRepository");
jest.mock("bcryptjs");

const mockUser = {
  user_tblkey: 1,
  email: "test@example.com",
  password_hash: "hashed_password",
  created_at: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthService.signup", () => {
  it("신규 유저를 등록하고 토큰을 반환한다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (RefreshTokenRepository.deleteByEmail as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

    const result = await AuthService.signup("test@example.com", "password123");

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).not.toHaveProperty("password_hash");
  });

  it("이미 가입된 이메일이면 BadRequestError를 던진다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(AuthService.signup("test@example.com", "password123")).rejects.toThrow(BadRequestError);
    await expect(AuthService.signup("test@example.com", "password123")).rejects.toThrow("이미 가입된 이메일");
  });

  it("비밀번호가 8자 미만이면 BadRequestError를 던진다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.signup("test@example.com", "short")).rejects.toThrow(BadRequestError);
  });

  it("이메일을 소문자로 정규화한다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (RefreshTokenRepository.deleteByEmail as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

    await AuthService.signup("TEST@EXAMPLE.COM", "password123");

    expect(UserRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("기존 refresh token을 삭제하고 새 토큰을 저장한다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);
    (RefreshTokenRepository.deleteByEmail as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

    await AuthService.signup("test@example.com", "password123");

    expect(RefreshTokenRepository.deleteByEmail).toHaveBeenCalledWith("test@example.com");
    expect(RefreshTokenRepository.save).toHaveBeenCalledTimes(1);
  });
});

describe("AuthService.login", () => {
  it("올바른 이메일/비밀번호로 로그인하면 토큰을 반환한다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (RefreshTokenRepository.deleteByEmail as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);

    const result = await AuthService.login("test@example.com", "password123");

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).not.toHaveProperty("password_hash");
  });

  it("존재하지 않는 이메일이면 UnauthorizedError를 던진다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.login("nouser@example.com", "password123")).rejects.toThrow(UnauthorizedError);
  });

  it("비밀번호가 틀리면 UnauthorizedError를 던진다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(AuthService.login("test@example.com", "wrongpassword")).rejects.toThrow(UnauthorizedError);
  });

  it("이메일을 소문자로 정규화해서 조회한다", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (RefreshTokenRepository.deleteByEmail as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);

    await AuthService.login("TEST@EXAMPLE.COM", "password123");

    expect(UserRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("존재하지 않는 이메일과 비밀번호 오류가 동일한 메시지를 반환한다 (정보 노출 방지)", async () => {
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    const error1 = await AuthService.login("nouser@example.com", "password123").catch((e) => e);

    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const error2 = await AuthService.login("test@example.com", "wrongpassword").catch((e) => e);

    expect(error1.message).toBe(error2.message);
  });
});

describe("AuthService.refresh", () => {
  it("유효한 refresh token으로 새 토큰 쌍을 반환한다", async () => {
    (RefreshTokenRepository.find as jest.Mock).mockResolvedValue({ email: "test@example.com" });
    (RefreshTokenRepository.delete as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    const result = await AuthService.refresh("valid-refresh-token");

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it("존재하지 않는 refresh token이면 UnauthorizedError를 던진다", async () => {
    (RefreshTokenRepository.find as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.refresh("invalid-token")).rejects.toThrow(UnauthorizedError);
  });

  it("토큰 rotation: 기존 토큰을 삭제하고 새 토큰을 저장한다", async () => {
    (RefreshTokenRepository.find as jest.Mock).mockResolvedValue({ email: "test@example.com" });
    (RefreshTokenRepository.delete as jest.Mock).mockResolvedValue(undefined);
    (RefreshTokenRepository.save as jest.Mock).mockResolvedValue(undefined);
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await AuthService.refresh("old-refresh-token");

    expect(RefreshTokenRepository.delete).toHaveBeenCalledWith("old-refresh-token");
    expect(RefreshTokenRepository.save).toHaveBeenCalledTimes(1);
  });

  it("refresh token에 해당하는 유저가 없으면 UnauthorizedError를 던진다", async () => {
    (RefreshTokenRepository.find as jest.Mock).mockResolvedValue({ email: "ghost@example.com" });
    (RefreshTokenRepository.delete as jest.Mock).mockResolvedValue(undefined);
    (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.refresh("orphan-token")).rejects.toThrow(UnauthorizedError);
  });
});

describe("AuthService.logout", () => {
  it("refresh token을 DB에서 삭제한다", async () => {
    (RefreshTokenRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await AuthService.logout("some-refresh-token");

    expect(RefreshTokenRepository.delete).toHaveBeenCalledWith("some-refresh-token");
  });
});
