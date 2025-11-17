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
}

export interface FavoritePayload {
  inventionTitle: string;
  applicantName: string;
  abstract?: string;
  applicationDate: string;
  applicationNumber: string;
  openNumber?: string;
  publicationDate?: string;
  publicationNumber?: string;
  registerDate?: string;
  registerNumber?: string | null;
  registerStatus?: string;
  drawingUrl?: string;
}
