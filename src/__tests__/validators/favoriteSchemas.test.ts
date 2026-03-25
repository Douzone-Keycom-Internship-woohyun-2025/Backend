import { createFavoriteSchema, updateFavoriteSchema } from "../../validators/favoriteSchemas";

const validFavorite = {
  applicationNumber: "1020240012345",
  inventionTitle: "인공지능 기반 특허 분석 시스템",
  applicantName: "삼성전자주식회사",
  applicationDate: "20240103",
};

describe("createFavoriteSchema", () => {
  it("필수 필드만 있어도 통과한다", () => {
    const result = createFavoriteSchema.safeParse(validFavorite);
    expect(result.success).toBe(true);
  });

  it("출원번호에 숫자가 아닌 문자가 있으면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, applicationNumber: "KR-2024-001" });
    expect(result.success).toBe(false);
  });

  it("출원번호가 빈 문자열이면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, applicationNumber: "" });
    expect(result.success).toBe(false);
  });

  it("출원일이 YYYYMMDD 형식이 아니면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, applicationDate: "2024-01-03" });
    expect(result.success).toBe(false);
  });

  it("발명 명칭이 500자 초과이면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, inventionTitle: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("출원인명이 200자 초과이면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, applicantName: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("drawingUrl이 유효한 URL이 아니면 실패한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, drawingUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("선택 필드(abstract, memo 등)가 null이어도 통과한다", () => {
    const result = createFavoriteSchema.safeParse({ ...validFavorite, abstract: null, registerStatus: null });
    expect(result.success).toBe(true);
  });
});

describe("updateFavoriteSchema", () => {
  it("memo 값이 있으면 통과한다", () => {
    const result = updateFavoriteSchema.safeParse({ memo: "중요한 특허" });
    expect(result.success).toBe(true);
  });

  it("memo가 null이어도 통과한다", () => {
    const result = updateFavoriteSchema.safeParse({ memo: null });
    expect(result.success).toBe(true);
  });

  it("memo가 5000자 초과이면 실패한다", () => {
    const result = updateFavoriteSchema.safeParse({ memo: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });
});
