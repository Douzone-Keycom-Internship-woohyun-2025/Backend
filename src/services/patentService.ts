import axios from "axios";
import xml2js from "xml2js";
import { KIPRIS_KEY, KIPRIS_BASE } from "../config/env";
import { PatentListResult, PatentItemRaw } from "../types/kipris";
import { DEFAULT_ROWS_PER_PAGE } from "../constants/pagination";
import { NotFoundError } from "../errors/notFoundError";

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

interface PatentSearchParmas {
  applicant?: string;
  startDate: string;
  endDate: string;
  page?: number;
}

interface PatentAdvancedSearchParams {
  applicant?: string;
  inventionTitle?: string;
  registerStatus?: string;
  startDate: string;
  endDate: string;
  page?: number;
}

type SearchParams =
  | PatentRequestParams
  | { applicationNumber: string; ServiceKey: string };

interface PatentRequestParams {
  applicant?: string;
  inventionTitle?: string;
  lastvalue?: string;
  patent?: boolean;
  ServiceKey: string;
  applicationDate: string;
  pageNo: number;
  numOfRows: number;
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

export const PatentService = {
  async basicSearch({
    applicant,
    startDate,
    endDate,
    page = 1,
  }: PatentSearchParmas): Promise<PatentListResult> {
    const params: PatentRequestParams = {
      applicant,
      patent: true,
      ServiceKey: KIPRIS_KEY,
      applicationDate: `${startDate}~${endDate}`,
      pageNo: page,
      numOfRows: DEFAULT_ROWS_PER_PAGE,
    };

    const r = await searchPatents(params);

    return {
      total: r.total,
      page: r.pageNo,
      totalPages: Math.ceil(r.total / r.numOfRows),
      patents: r.items,
    };
  },

  async advancedSearch({
    applicant,
    inventionTitle,
    registerStatus,
    startDate,
    endDate,
    page = 1,
  }: PatentAdvancedSearchParams): Promise<PatentListResult> {
    const lastvalue = statusMap[registerStatus ?? ""] ?? "";

    const params: PatentRequestParams = {
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

    return {
      total: r.total,
      page: r.pageNo,
      totalPages: Math.ceil(r.total / r.numOfRows),
      patents: r.items,
    };
  },

  async getDetail(applicationNumber: string): Promise<PatentItemRaw> {
    const params = {
      applicationNumber,
      ServiceKey: KIPRIS_KEY,
    };

    const r = await searchPatents(params);
    const items = r.items;

    if (!items || items.length === 0) {
      throw new NotFoundError("특허 정보를 찾을 수 없습니다.");
    }

    return items[0];
  },
};
