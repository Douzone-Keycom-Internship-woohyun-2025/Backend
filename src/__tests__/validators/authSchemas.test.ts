import { signupSchema, loginSchema, refreshSchema } from "../../validators/authSchemas";

describe("signupSchema", () => {
  it("유효한 이메일과 비밀번호를 통과시킨다", () => {
    const result = signupSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("이메일 형식이 잘못되면 실패한다", () => {
    const result = signupSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("비밀번호가 8자 미만이면 실패한다", () => {
    const result = signupSchema.safeParse({ email: "test@example.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("비밀번호가 72자 초과이면 실패한다", () => {
    const result = signupSchema.safeParse({ email: "test@example.com", password: "a".repeat(73) });
    expect(result.success).toBe(false);
  });

  it("이메일이 없으면 실패한다", () => {
    const result = signupSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("유효한 이메일과 비밀번호를 통과시킨다", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "anypassword" });
    expect(result.success).toBe(true);
  });

  it("비밀번호가 빈 문자열이면 실패한다", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("이메일 형식이 잘못되면 실패한다", () => {
    const result = loginSchema.safeParse({ email: "bad-email", password: "password" });
    expect(result.success).toBe(false);
  });
});

describe("refreshSchema", () => {
  it("토큰이 있으면 통과한다", () => {
    const result = refreshSchema.safeParse({ refreshToken: "some-token-value" });
    expect(result.success).toBe(true);
  });

  it("토큰이 빈 문자열이면 실패한다", () => {
    const result = refreshSchema.safeParse({ refreshToken: "" });
    expect(result.success).toBe(false);
  });

  it("refreshToken 필드가 없으면 실패한다", () => {
    const result = refreshSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
