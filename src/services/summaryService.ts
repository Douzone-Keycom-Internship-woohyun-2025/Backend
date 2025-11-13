import axios from "axios";
import xml2js from "xml2js";

const KIPRIS_KEY = process.env.KIPRIS_API_KEY!;
const KIPRIS_BASE = process.env.KIPRIS_BASE_URL!;

export interface PatentItem {
  applicantName: string;
  applicationDate: string;
  ipcNumber: string;
  registerStatus: string;
}

export interface PatentStatResult {
  totalCount: number;
  statusCount: Record<string, number>;
  statusPercent: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  topIPC: Array<{ code: string; count: number }>;
  recentPatents: Array<{
    applicantName: string;
    inventionTitle: string;
    applicationDate: string;
    registerStatus: string;
    ipcMain: string | null;
  }>;
  avgMonthlyCount: number;
}

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

  const res = await axios.get(url, { params });
  const xml = res.data;

  const json = await xml2js.parseStringPromise(xml, { explicitArray: false });
  const body = json?.response?.body;
  const count = json?.response?.count;

  return {
    items: body?.items?.item || [],
    totalCount: Number(count?.totalCount ?? 0),
    numOfRows: Number(count?.numOfRows ?? numOfRows),
    pageNo: Number(count?.pageNo ?? page),
  };
}

function ensureArray(v: any): PatentItem[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

async function fetchAll(
  applicant: string,
  start: string,
  end: string
): Promise<PatentItem[]> {
  const first = await fetchPage(applicant, start, end, 1, 100);

  const total = first.totalCount;
  const pageSize = 100;
  const totalPages = Math.ceil(total / pageSize);

  let items: PatentItem[] = [];
  items.push(...ensureArray(first.items));

  for (let page = 2; page <= totalPages; page++) {
    await new Promise((r) => setTimeout(r, 250));

    const p = await fetchPage(applicant, start, end, page, 100);
    items.push(...ensureArray(p.items));
  }

  return items;
}

export const PatentStatService = {
  async analyze({
    applicant,
    startDate,
    endDate,
  }: {
    applicant: string;
    startDate: string;
    endDate: string;
  }): Promise<PatentStatResult> {
    const items = await fetchAll(applicant, startDate, endDate);
    const total = items.length;

    // ---- 상태 카운트 ----
    const statusCount: Record<string, number> = {};
    for (const p of items) {
      const s = p.registerStatus || "기타";
      statusCount[s] = (statusCount[s] || 0) + 1;
    }

    // ---- 상태 퍼센트 ----
    const statusPercent: Record<string, number> = {};
    for (const k in statusCount) {
      statusPercent[k] = Number(((statusCount[k] / total) * 100).toFixed(2));
    }

    // ---- 월별 트렌드(전체) ----
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

    // ---- 최근 6개월 기준 월평균 ----
    const recent6 = monthlyTrend.slice(-6);
    let avgMonthlyCount = 0;
    if (recent6.length > 0) {
      const sum = recent6.reduce((acc, c) => acc + c.count, 0);
      avgMonthlyCount = Number((sum / recent6.length).toFixed(2));
    }

    // ---- IPC TOP5 ----
    const ipcMap: Record<string, number> = {};
    for (const p of items) {
      if (!p.ipcNumber) continue;
      const group = p.ipcNumber.split("|");
      const first = group[0].trim();
      const code4 = first.replace(/\s+/g, "").slice(0, 4);
      ipcMap[code4] = (ipcMap[code4] || 0) + 1;
    }

    const topIPC = Object.entries(ipcMap)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ---- 최근 특허 3건 ----
    const recentPatents = [...items]
      .sort((a, b) => Number(b.applicationDate) - Number(a.applicationDate))
      .slice(0, 3)
      .map((p: any) => ({
        applicantName: p.applicantName,
        inventionTitle: p.inventionTitle,
        applicationDate: p.applicationDate,
        registerStatus: p.registerStatus,
        ipcMain: p.ipcNumber
          ? p.ipcNumber.split("|")[0].trim().replace(/\s+/g, "").slice(0, 4)
          : null,
      }));

    return {
      totalCount: total,
      statusCount,
      statusPercent,
      monthlyTrend,
      topIPC,
      recentPatents,
      avgMonthlyCount,
    };
  },
};
