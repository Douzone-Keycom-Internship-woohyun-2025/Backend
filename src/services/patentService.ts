import axios from "axios";
import xml2js from "xml2js";

import { KIPRIS_KEY } from "../config/env";
import { KIPRIS_BASE } from "../config/env";

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
  undefined: "",
};

async function searchPatents(params: any) {
  const url = `${KIPRIS_BASE}/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch`;
  const res = await axios.get(url, { params });

  const json = await parseXml(res.data);
  const body = json?.response?.body;
  const count = json?.response?.count;

  return {
    items: ensureArray(body?.items?.item),
    total: Number(count?.totalCount ?? 0),
    numOfRows: Number(count?.numOfRows ?? 20),
    pageNo: Number(count?.pageNo ?? 1),
  };
}

export const PatentService = {
  async basicSearch({
    applicant,
    startDate,
    endDate,
    page = 1,
  }: {
    applicant: string;
    startDate: string;
    endDate: string;
    page: number;
  }) {
    const params = {
      applicant,
      patent: true,
      ServiceKey: KIPRIS_KEY,
      applicationDate: `${startDate}~${endDate}`,
      pageNo: page,
      numOfRows: 20,
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
  }: any) {
    const lastvalue = statusMap[registerStatus] ?? "";

    const params = {
      applicant,
      inventionTitle,
      lastvalue,
      patent: true,
      ServiceKey: KIPRIS_KEY,
      applicationDate: `${startDate}~${endDate}`,
      pageNo: page,
      numOfRows: 20,
    };

    const r = await searchPatents(params);

    return {
      total: r.total,
      page: r.pageNo,
      totalPages: Math.ceil(r.total / r.numOfRows),
      patents: r.items,
    };
  },

  async getDetail(applicationNumber: string) {
    const url = `${KIPRIS_BASE}/kipo-api/kipi/patUtiModInfoSearchSevice/getAdvancedSearch`;

    const params = {
      applicationNumber,
      ServiceKey: KIPRIS_KEY,
    };

    const res = await axios.get(url, { params });
    const json = await parseXml(res.data);

    const items = json?.response?.body?.items?.item;

    if (!items) return null;

    return Array.isArray(items) ? items[0] : items;
  },
};
