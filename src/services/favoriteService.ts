import { pool } from "../config/db";
import { FavoritePayload } from "../types/favorite";
import { NotFoundError } from "../errors/notFoundError";
import { BadRequestError } from "../errors/badRequestError";
import { extractSubclass } from "../utils/ipc";

export const FavoriteService = {
  async create(userId: number, payload: FavoritePayload) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      if (!payload.applicationNumber)
        throw new BadRequestError("출원번호는 필수입니다.");
      if (!payload.inventionTitle)
        throw new BadRequestError("발명의 명칭은 필수입니다.");
      if (!payload.applicantName)
        throw new BadRequestError("출원인명은 필수입니다.");
      if (!payload.applicationDate)
        throw new BadRequestError("출원일은 필수입니다.");

      const existing = await client.query(
        `
        SELECT 1
        FROM favorite_patents
        WHERE user_tblkey = $1 AND application_number = $2
        `,
        [userId, payload.applicationNumber]
      );

      if (existing.rows.length > 0)
        throw new BadRequestError("이미 즐겨찾기에 추가된 특허입니다.");

      const insertFavorite = await client.query(
        `
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
          main_ipc_code
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *
        `,
        [
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
        ]
      );

      const favorite = insertFavorite.rows[0];

      if (payload.ipcNumber && payload.ipcNumber.trim() !== "") {
        const rawCodes = payload.ipcNumber.split("|").map((c) => c.trim());
        const subclassList = rawCodes
          .map((c) => extractSubclass(c))
          .filter((v): v is string => v !== null);

        for (const subclass of subclassList) {
          await client.query(
            `
            INSERT INTO patent_ipc_subclass_map (patent_tblkey, ipc_subclass)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `,
            [favorite.patent_tblkey, subclass]
          );
        }
      }

      await client.query("COMMIT");

      return favorite;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async list(userId: number) {
    const result = await pool.query(
      `
      SELECT *
      FROM favorite_patents
      WHERE user_tblkey = $1
      ORDER BY adddate DESC
      `,
      [userId]
    );
    return result.rows;
  },

  async get(userId: number, applicationNumber: string) {
    const result = await pool.query(
      `
      SELECT *
      FROM favorite_patents
      WHERE user_tblkey = $1 AND application_number = $2
      `,
      [userId, applicationNumber]
    );
    if (result.rows.length === 0)
      throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
    return result.rows[0];
  },

  async remove(userId: number, applicationNumber: string) {
    const result = await pool.query(
      `
      DELETE FROM favorite_patents
      WHERE user_tblkey = $1 AND application_number = $2
      `,
      [userId, applicationNumber]
    );
    if (result.rowCount === 0)
      throw new NotFoundError("즐겨찾기를 찾을 수 없습니다.");
  },
};
