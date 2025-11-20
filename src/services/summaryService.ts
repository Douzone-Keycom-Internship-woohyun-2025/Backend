import axios from "axios";
import xml2js from "xml2js";

import { KIPRIS_KEY } from "../config/env";
import { KIPRIS_BASE } from "../config/env";

if (!KIPRIS_KEY || !KIPRIS_BASE) {
  throw new Error(
    "KIPRIS_API_KEY or KIPRIS_BASE_URL 환경변수 설정이 안되어있습니다."
  );
}

export interface PatentItem {
  applicantName: string;
  applicationDate: string;
  ipcNumber: string;
  registerStatus: string;
  inventionTitle?: string;
}

export interface PatentStatResult {
  totalCount: number;
  statusCount: Record<string, number>;
  statusPercent: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  topIPC: Array<{ code: string; count: number }>;
  avgMonthlyCount: number;
  recentPatents: Array<{
    title: string;
    date: string;
    ipcMain: string | null;
    status: string;
  }>;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureArray(v: any): PatentItem[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function getIpcMainCode(ipc: string): string | null {
  if (!ipc) return null;
  const first = ipc.split("|")[0].trim();
  return first.replace(/\s+/g, "").slice(0, 4);
}

// ==========================================================
// 📌 fetchPage(): KIPRIS 한 페이지 조회 + 디버그 로그
// ==========================================================
async function fetchPage(
  applicant: string,
  start: string,
  end: string,
  page = 1,
  numOfRows = 100
) {
  const url = `${KIPRIS_BASE}/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch`;

  const params = {
    applicant,
    patent: true,
    ServiceKey: KIPRIS_KEY,
    applicationDate: `${start}~${end}`,
    numOfRows,
    pageNo: page,
  };

  console.log("🌍 [Render] fetchPage 호출");
  console.log("👉 applicant:", applicant);
  console.log("👉 start:", start);
  console.log("👉 end:", end);
  console.log("👉 page:", page);

  let res;
  try {
    res = await axios.get(url, { params });
  } catch (err: any) {
    console.log("❌ KIPRIS 요청 실패");
    console.log("status:", err.response?.status);
    console.log("data:", err.response?.data?.slice?.(0, 300));
    throw err;
  }

  console.log("✅ KIPRIS HTTP STATUS:", res.status);
  console.log("📄 XML 응답 일부:", res.data?.slice?.(0, 300));

  const xml = res.data;

  const json = await xml2js.parseStringPromise(xml, { explicitArray: false });
  const body = json?.response?.body;
  const count = json?.response?.count;

  console.log("📦 totalCount:", count?.totalCount);

  return {
    items: ensureArray(body?.items?.item),
    totalCount: Number(count?.totalCount ?? 0),
    numOfRows: Number(count?.numOfRows ?? numOfRows),
    pageNo: Number(count?.pageNo ?? page),
  };
}

// ==========================================================
// 📌 fetchAll(): 전체 페이지 병렬 조회 + 로그
// ==========================================================
async function fetchAll(
  applicant: string,
  start: string,
  end: string
): Promise<PatentItem[]> {
  console.log("📥 fetchAll 요청:");
  console.log("👉 applicant:", applicant);
  console.log("👉 start:", start);
  console.log("👉 end:", end);

  const first = await fetchPage(applicant, start, end, 1, 100);

  console.log("📦 첫 페이지 totalCount:", first.totalCount);

  const total = first.totalCount;
  const pageSize = 100;
  const totalPages = Math.ceil(total / pageSize);

  let items: PatentItem[] = [...first.items];

  const concurrency = 5;
  let batch: ReturnType<typeof fetchPage>[] = [];

  const processBatch = async (
    batchToProcess: ReturnType<typeof fetchPage>[]
  ) => {
    if (batchToProcess.length === 0) return;
    const results = await Promise.all(batchToProcess);
    items.push(...results.flatMap((r) => r.items));
  };

  for (let page = 2; page <= totalPages; page++) {
    batch.push(fetchPage(applicant, start, end, page, 100));

    if (batch.length >= concurrency) {
      await processBatch(batch);
      batch = [];
      await sleep(200);
    }
  }

  if (batch.length > 0) {
    await processBatch(batch);
  }

  console.log("📊 fetchAll 최종 items 개수:", items.length);

  return items;
}

// ==========================================================
// 📌 SummaryService.analyze(): 전체 분석 + 로그
// ==========================================================
export const SummaryService = {
  async analyze({
    applicant,
    startDate,
    endDate,
  }: {
    applicant: string;
    startDate: string;
    endDate: string;
  }): Promise<PatentStatResult> {
    console.log("🚀 [analyze] 시작");
    console.log("🔎 applicant:", applicant);
    console.log("🔎 startDate:", startDate);
    console.log("🔎 endDate:", endDate);

    const items = await fetchAll(applicant, startDate, endDate);

    console.log("📊 분석 대상 특허 개수:", items.length);

    const total = items.length;

    const statusCount: Record<string, number> = {};
    for (const p of items) {
      const s = p.registerStatus || "기타";
      statusCount[s] = (statusCount[s] || 0) + 1;
    }

    const statusPercent: Record<string, number> = {};
    for (const k in statusCount) {
      statusPercent[k] =
        total > 0 ? Number(((statusCount[k] / total) * 100).toFixed(2)) : 0;
    }

    const monthlyMap: Record<string, number> = {};
    for (const p of items) {
      const y = p.applicationDate.slice(0, 4);
      const m = p.applicationDate.slice(4, 6);
      const key = `${y}-${m}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    }

    const monthlyTrend = Object.entries(monthlyMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const lastSix = monthlyTrend.slice(-6);
    const avgMonthlyCount =
      lastSix.reduce((acc, cur) => acc + cur.count, 0) / (lastSix.length || 1);

    const ipcMap: Record<string, number> = {};
    for (const p of items) {
      const code4 = getIpcMainCode(p.ipcNumber);
      if (code4) ipcMap[code4] = (ipcMap[code4] || 0) + 1;
    }

    const topIPC = Object.entries(ipcMap)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentPatents = [...items]
      .sort((a, b) => Number(b.applicationDate) - Number(a.applicationDate))
      .slice(0, 3)
      .map((p: PatentItem) => ({
        title: p.inventionTitle || "(제목 없음)",
        date: p.applicationDate,
        ipcMain: getIpcMainCode(p.ipcNumber),
        status: p.registerStatus,
      }));

    console.log("🎯 summaryService analyze 완료");

    return {
      totalCount: total,
      statusCount,
      statusPercent,
      monthlyTrend,
      topIPC,
      avgMonthlyCount: Number(avgMonthlyCount.toFixed(2)),
      recentPatents,
    };
  },
};
