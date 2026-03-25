import { basicSearchSchema, advancedSearchSchema } from "../../validators/patentSchemas";

describe("basicSearchSchema", () => {
  it("출원인만 있어도 통과한다", () => {
    const result = basicSearchSchema.safeParse({ applicant: "삼성전자" });
    expect(result.success).toBe(true);
  });

  it("기본값: page=1, sort=desc", () => {
    const result = basicSearchSchema.safeParse({ applicant: "삼성전자" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.sort).toBe("desc");
    }
  });

  it("출원인이 없으면 실패한다", () => {
    const result = basicSearchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("날짜가 YYYYMMDD 형식이 아니면 실패한다", () => {
    const result = basicSearchSchema.safeParse({ applicant: "삼성전자", startDate: "2024-01-01" });
    expect(result.success).toBe(false);
  });

  it("유효한 YYYYMMDD 날짜를 통과시킨다", () => {
    const result = basicSearchSchema.safeParse({
      applicant: "삼성전자",
      startDate: "20240101",
      endDate: "20241231",
    });
    expect(result.success).toBe(true);
  });

  it("page가 1000 초과이면 실패한다", () => {
    const result = basicSearchSchema.safeParse({ applicant: "삼성전자", page: 1001 });
    expect(result.success).toBe(false);
  });

  it("sort가 asc/desc 외 값이면 실패한다", () => {
    const result = basicSearchSchema.safeParse({ applicant: "삼성전자", sort: "random" });
    expect(result.success).toBe(false);
  });
});

describe("advancedSearchSchema", () => {
  it("inventionTitle만 있어도 통과한다", () => {
    const result = advancedSearchSchema.safeParse({ inventionTitle: "인공지능" });
    expect(result.success).toBe(true);
  });

  it("registerStatus만 있어도 통과한다", () => {
    const result = advancedSearchSchema.safeParse({ registerStatus: "등록" });
    expect(result.success).toBe(true);
  });

  it("검색 조건이 하나도 없으면 실패한다", () => {
    const result = advancedSearchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("유효하지 않은 registerStatus 값이면 실패한다", () => {
    const result = advancedSearchSchema.safeParse({ registerStatus: "존재안함" });
    expect(result.success).toBe(false);
  });

  it("startDate만 있어도 통과한다", () => {
    const result = advancedSearchSchema.safeParse({ startDate: "20240101" });
    expect(result.success).toBe(true);
  });
});
