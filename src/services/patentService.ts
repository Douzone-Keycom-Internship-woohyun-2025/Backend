import axios from "axios";
import xml2js from "xml2js";
import { KIPRIS_KEY, KIPRIS_BASE } from "../config/env";
import { PatentListResult, PatentItemRaw, SearchParams } from "../types/kipris";
import { DEFAULT_ROWS_PER_PAGE } from "../controllers/constants/pagination";
import { NotFoundError } from "../errors/notFoundError";
import { IpcSubclassDictionary } from "../repositories/ipcSubclassDictionary";
import { FavoriteRepository } from "../repositories/favoriteRepository";

const KIPRIS_ADVANCED_SEARCH_URL = `${KIPRIS_BASE}/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch`;

function ensureArray(v: any) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

async function parseXml(xml: string) {
  return xml2js.parseStringPromise(xml, { explicitArray: false });
}

const statusMap: Record<string, string> = {
  공개: "A",
  취하: "C",
  소멸: "F",
  포기: "G",
  무효: "I",
  거절: "J",
  등록: "R",
  "": "",
};

function extractMainIpcCode(ipcNumber?: string): string | undefined {
  if (!ipcNumber) return undefined;
  const firstCode = ipcNumber.split("|")[0]?.trim();
  return firstCode?.split(" ")[0];
}

async function searchPatents(params: SearchParams) {
  const res = await axios.get(KIPRIS_ADVANCED_SEARCH_URL, { params });
  const json = await parseXml(res.data);
  const body = json?.response?.body;
  const count = json?.response?.count;

  return {
    items: ensureArray(body?.items?.item),
    total: Number(count?.totalCount ?? 0),
    numOfRows: Number(count?.numOfRows ?? DEFAULT_ROWS_PER_PAGE),
    pageNo: Number(count?.pageNo ?? 1),
  };
}

async function addIpcMapping(items: PatentItemRaw[]): Promise<PatentItemRaw[]> {
  return items.map((item) => {
    const mainIpcCode = extractMainIpcCode(item.ipcNumber);
    const ipcKorName = mainIpcCode
      ? IpcSubclassDictionary.getKorName(mainIpcCode) ?? "알 수 없음"
      : undefined;

    return {
      ...item,
      mainIpcCode,
      ipcKorName,
    };
  });
}

async function attachFavoriteInfo(
  userId: number | undefined,
  items: PatentItemRaw[]
) {
  if (!userId) {
    return items.map((p) => ({ ...p, isFavorite: false }));
  }

  const favList = await FavoriteRepository.getUserFavoriteNumbers(userId);
  const favSet = new Set(favList);

  return items.map((p) => ({
    ...p,
    isFavorite: p.applicationNumber ? favSet.has(p.applicationNumber) : false,
  }));
}

export const PatentService = {
  async basicSearch({
    userId,
    applicant,
    startDate,
    endDate,
    page = 1,
  }: {
    userId?: number;
    applicant?: string;
    startDate: string;
    endDate: string;
    page?: number;
  }): Promise<PatentListResult> {
    const params: SearchParams = {
      applicant,
      patent: true,
      ServiceKey: KIPRIS_KEY, // ✔ SearchParams 타입에 맞춤
      applicationDate: `${startDate}~${endDate}`,
      pageNo: page,
      numOfRows: DEFAULT_ROWS_PER_PAGE,
    };

    const r = await searchPatents(params);

    const mapped = await addIpcMapping(r.items);
    const withFav = await attachFavoriteInfo(userId, mapped);

    return {
      total: r.total,
      page: r.pageNo,
      totalPages: Math.ceil(r.total / r.numOfRows),
      patents: withFav,
    };
  },

  async advancedSearch({
    userId,
    applicant,
    inventionTitle,
    registerStatus,
    startDate,
    endDate,
    page = 1,
  }: {
    userId?: number;
    applicant?: string;
    inventionTitle?: string;
    registerStatus?: string;
    startDate: string;
    endDate: string;
    page?: number;
  }): Promise<PatentListResult> {
    const lastvalue = statusMap[registerStatus ?? ""] ?? "";

    const params: SearchParams = {
      applicant,
      inventionTitle,
      lastvalue,
      patent: true,
      ServiceKey: KIPRIS_KEY,
      applicationDate: `${startDate}~${endDate}`,
      pageNo: page,
      numOfRows: DEFAULT_ROWS_PER_PAGE,
    };

    const r = await searchPatents(params);

    const mapped = await addIpcMapping(r.items);
    const withFav = await attachFavoriteInfo(userId, mapped);

    return {
      total: r.total,
      page: r.pageNo,
      totalPages: Math.ceil(r.total / r.numOfRows),
      patents: withFav,
    };
  },

  async getDetail(applicationNumber: string, userId?: number): Promise<any> {
    const params: SearchParams = {
      applicationNumber,
      ServiceKey: KIPRIS_KEY,
    };

    const r = await searchPatents(params);

    if (!r.items || r.items.length === 0) {
      throw new NotFoundError("특허 정보를 찾을 수 없습니다.");
    }

    const [item] = await addIpcMapping(r.items);

    // ✔ 단일 조회 최적화
    let isFavorite = false;
    if (userId) {
      const fav = await FavoriteRepository.findByApplicationNumber(
        userId,
        applicationNumber
      );
      isFavorite = !!fav;
    }

    return { ...item, isFavorite };
  },
};
