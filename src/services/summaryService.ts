import axios from "axios";
import xml2js from "xml2js";

import { KIPRIS_KEY } from "../config/env";
import { KIPRIS_BASE } from "../config/env";
import { IpcSubclassDictionary } from "../repositories/ipcSubclassDictionary";

export interface PatentItem {
  applicationNumber: string;
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
  topIPC: Array<{ code: string; korName: string; count: number }>;
  avgMonthlyCount: number;
  recentPatents: Array<{
    applicationNumber: string;
    title: string;
    date: string;
    ipcMain: string | null;
    ipcKorName: string;
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

/** ◆ 4글자 Main IPC 코드 추출 */
function getIpcMainCode(ipc: string): string | null {
  if (!ipc) return null;
  const first = ipc.split("|")[0].trim();
  return first.replace(/\s+/g, "").slice(0, 4);
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
    items: ensureArray(body?.items?.item),
    totalCount: Number(count?.totalCount ?? 0),
    numOfRows: Number(count?.numOfRows ?? numOfRows),
    pageNo: Number(count?.pageNo ?? page),
  };
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

  return items;
}

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
    const items = await fetchAll(applicant, startDate, endDate);
    const total = items.length;

    /** --- 상태 비율 계산 --- */
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

    /** --- 월별 추이 --- */
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

    /** --- IPC 카테고리 Top5 --- */
    const ipcMap: Record<string, number> = {};
    for (const p of items) {
      const code4 = getIpcMainCode(p.ipcNumber);
      if (code4) ipcMap[code4] = (ipcMap[code4] || 0) + 1;
    }

    const topIPC = Object.entries(ipcMap)
      .map(([code, count]) => ({
        code,
        korName: IpcSubclassDictionary.getKorName(code) ?? "알 수 없음",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    /** --- 최근 특허 3개 --- */
    const recentPatents = [...items]
      .sort((a, b) => Number(b.applicationDate) - Number(a.applicationDate))
      .slice(0, 3)
      .map((p) => {
        const code = getIpcMainCode(p.ipcNumber);
        return {
          applicationNumber: p.applicationNumber,
          title: p.inventionTitle || "(제목 없음)",
          date: p.applicationDate,
          ipcMain: code,
          ipcKorName: code
            ? IpcSubclassDictionary.getKorName(code) ?? "알 수 없음"
            : "알 수 없음",
          status: p.registerStatus,
        };
      });

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
