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

  async updateMemo(
    userId: number,
    applicationNumber: string,
    memo: string | null
  ): Promise<FavoriteRow | null> {
    const result = await pool.query(
      `UPDATE favorite_patents SET memo = $1 WHERE user_tblkey = $2 AND application_number = $3 RETURNING *`,
      [memo, userId, applicationNumber]
    );
    return result.rows[0] || null;
  },

  async getAnalysis(userId: number): Promise<{
    totalCount: number;
    statusCounts: Array<{ status: string; count: number }>;
    ipcCounts: Array<{ ipc_code: string; count: number }>;
    monthlyCounts: Array<{ month: string; count: number }>;
  }> {
    const [statusResult, ipcResult, monthlyResult, totalResult] =
      await Promise.all([
        pool.query(
          `SELECT register_status as status, COUNT(*)::int as count
           FROM favorite_patents WHERE user_tblkey = $1 AND register_status IS NOT NULL
           GROUP BY register_status ORDER BY count DESC`,
          [userId]
        ),
        pool.query(
          `SELECT main_ipc_code as ipc_code, COUNT(*)::int as count
           FROM favorite_patents WHERE user_tblkey = $1 AND main_ipc_code IS NOT NULL
           GROUP BY main_ipc_code ORDER BY count DESC LIMIT 10`,
          [userId]
        ),
        pool.query(
          `SELECT SUBSTRING(application_date, 1, 6) as month, COUNT(*)::int as count
           FROM favorite_patents WHERE user_tblkey = $1 AND application_date IS NOT NULL AND LENGTH(application_date) >= 6
           GROUP BY month ORDER BY month DESC LIMIT 12`,
          [userId]
        ),
        pool.query(
          `SELECT COUNT(*)::int as count FROM favorite_patents WHERE user_tblkey = $1`,
          [userId]
        ),
      ]);

    return {
      totalCount: totalResult.rows[0]?.count || 0,
      statusCounts: statusResult.rows,
      ipcCounts: ipcResult.rows,
      monthlyCounts: monthlyResult.rows,
    };
  },
};
