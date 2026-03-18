export interface FavoriteRow {
  patent_tblkey: number;
  user_tblkey: number;
  invention_title: string;
  applicant_name: string;
  abstract: string | null;
  application_date: string;
  application_number: string;
  publication_date: string | null;
  publication_number: string | null;
  register_date: string | null;
  register_number: string | null;
  register_status: string | null;
  drawing_url: string | null;
  adddate: Date;
  open_number: string | null;
  ipc_number: string | null;
  main_ipc_code: string | null;
}

export interface FavoritePayload {
  inventionTitle: string;
  applicantName: string;
  abstract?: string | null;
  applicationDate: string;
  applicationNumber: string;
  openNumber?: string | null;
  publicationDate?: string | null;
  publicationNumber?: string | null;
  registerDate?: string | null;
  registerNumber?: string | null;
  registerStatus?: string | null;
  drawingUrl?: string | null;
  ipcNumber?: string | null;
  mainIpcCode?: string | null;
}
