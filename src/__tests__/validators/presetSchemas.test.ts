import { createPresetSchema, updatePresetSchema } from "../../validators/presetSchemas";

const validPreset = {
  presetName: "삼성 특허 모니터링",
  applicant: "삼성전자",
  startDate: "20200101",
  endDate: "20241231",
};

describe("createPresetSchema", () => {
  it("유효한 데이터를 통과시킨다", () => {
    const result = createPresetSchema.safeParse(validPreset);
    expect(result.success).toBe(true);
  });

  it("startDate가 endDate보다 늦으면 실패한다", () => {
    const result = createPresetSchema.safeParse({
      ...validPreset,
      startDate: "20241231",
      endDate: "20200101",
    });
    expect(result.success).toBe(false);
  });

  it("startDate와 endDate가 같으면 통과한다", () => {
    const result = createPresetSchema.safeParse({
      ...validPreset,
      startDate: "20240101",
      endDate: "20240101",
    });
    expect(result.success).toBe(true);
  });

  it("날짜가 YYYYMMDD 형식이 아니면 실패한다", () => {
    const result = createPresetSchema.safeParse({ ...validPreset, startDate: "2024-01-01" });
    expect(result.success).toBe(false);
  });

  it("presetName이 없으면 실패한다", () => {
    const { presetName: _, ...rest } = validPreset;
    const result = createPresetSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("description은 선택 항목이다", () => {
    const result = createPresetSchema.safeParse({ ...validPreset, description: "설명 텍스트" });
    expect(result.success).toBe(true);
  });

  it("description이 500자 초과이면 실패한다", () => {
    const result = createPresetSchema.safeParse({ ...validPreset, description: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe("updatePresetSchema", () => {
  it("필드 하나만 있어도 통과한다", () => {
    const result = updatePresetSchema.safeParse({ presetName: "새 이름" });
    expect(result.success).toBe(true);
  });

  it("빈 객체이면 실패한다", () => {
    const result = updatePresetSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("startDate와 endDate 모두 있을 때 순서가 맞으면 통과한다", () => {
    const result = updatePresetSchema.safeParse({ startDate: "20200101", endDate: "20241231" });
    expect(result.success).toBe(true);
  });

  it("startDate와 endDate 모두 있을 때 순서가 틀리면 실패한다", () => {
    const result = updatePresetSchema.safeParse({ startDate: "20241231", endDate: "20200101" });
    expect(result.success).toBe(false);
  });

  it("startDate만 있을 때는 날짜 순서 검증을 하지 않는다", () => {
    const result = updatePresetSchema.safeParse({ startDate: "20241231" });
    expect(result.success).toBe(true);
  });
});
