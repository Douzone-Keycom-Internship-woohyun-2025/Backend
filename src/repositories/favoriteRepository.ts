import { pool } from "../config/db";
import { PoolClient } from "pg";
import { FavoritePayload, FavoriteRow } from "../types/favorite";

export const FavoriteRepository = {
  async create(userId: number, payload: FavoritePayload, client?: PoolClient): Promise<FavoriteRow> {
    const query = `
      INSERT INTO favorite_patents (
        user_tblkey,
        invention_title,
        applicant_name,
        abstract,
        application_date,
        application_number,
        open_number,
        publication_date,
        publication_number,
        register_date,
        register_number,
        register_status,
        drawing_url,
        main_ipc_code,
        ipc_number
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `;

    const values = [
      userId,
      payload.inventionTitle,
      payload.applicantName,
      payload.abstract || null,
      payload.applicationDate,
      payload.applicationNumber,
      payload.openNumber || null,
      payload.publicationDate || null,
      payload.publicationNumber || null,
      payload.registerDate || null,
      payload.registerNumber || null,
      payload.registerStatus || null,
      payload.drawingUrl || null,
      payload.mainIpcCode || null,
      payload.ipcNumber || null,
    ];

    const runner = client ?? pool;
    const result = await runner.query(query, values);
    return result.rows[0];
  },

  async findByApplicationNumber(
    userId: number,
    applicationNumber: string,
    client?: PoolClient
  ): Promise<FavoriteRow | null> {
    const runner = client ?? pool;
    const result = await runner.query(
      `SELECT * FROM favorite_patents WHERE user_tblkey = $1 AND application_number = $2`,
      [userId, applicationNumber]
    );
    return result.rows[0] || null;
  },

  async list(userId: number): Promise<FavoriteRow[]> {
    const result = await pool.query(
      `SELECT * FROM favorite_patents WHERE user_tblkey = $1 ORDER BY adddate DESC`,
      [userId]
    );
    return result.rows;
  },

  async delete(userId: number, applicationNumber: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM favorite_patents WHERE user_tblkey = $1 AND application_number = $2`,
      [userId, applicationNumber]
    );
    return (result.rowCount ?? 0) > 0;
  },

  // 🔥 추가: 유저의 즐겨찾기 applicationNumber 목록 가져오기
  async getUserFavoriteNumbers(userId: number): Promise<string[]> {
    const result = await pool.query(
      `SELECT application_number FROM favorite_patents WHERE user_tblkey = $1`,
      [userId]
    );

    return result.rows.map((r) => r.application_number);
  },
};
