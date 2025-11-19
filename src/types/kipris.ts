export interface PatentItemRaw {
  applicantName?: string;
  applicationDate?: string;
  applicationNumber?: string;
  inventionTitle?: string;
  ipcNumber?: string;
  openDate?: string;
  openNumber?: string;
  publicationDate?: string | null;
  publicationNumber?: string | null;
  registerDate?: string | null;
  registerNumber?: string | null;
  registerStatus?: string;
  astrtCont?: string;
  drawing?: string;
  mainIpcCode?: string;
  ipcKorName?: string;
  isFavorite?: boolean;
}

export interface PatentListResult {
  total: number;
  page: number;
  totalPages: number;
  patents: PatentItemRaw[];
}

export interface SearchParams {
  applicant?: string;
  inventionTitle?: string;
  lastvalue?: string;
  patent?: boolean;
  ServiceKey: string;
  applicationDate?: string;
  applicationNumber?: string;
  pageNo?: number;
  numOfRows?: number;
}
