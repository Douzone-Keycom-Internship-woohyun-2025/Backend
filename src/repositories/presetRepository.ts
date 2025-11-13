import { pool } from "../config/db";

export interface PresetRow {
  preset_tblkey: number;
  user_tblkey: number;
  preset_name: string;
  applicant: string;
  start_date: string;
  end_date: string;
  description: string | null;
  adddate: string;
}

export const PresetRepository = {
  async create(
    userId: number,
    p: {
      presetName: string;
      applicant: string;
      startDate: string;
      endDate: string;
      description?: string | null;
    }
  ): Promise<PresetRow> {
    const r = await pool.query(
      `INSERT INTO presets (user_tblkey, preset_name, applicant, start_date, end_date, description)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        userId,
        p.presetName,
        p.applicant,
        p.startDate,
        p.endDate,
        p.description ?? null,
      ]
    );
    return r.rows[0];
  },

  async list(
    userId: number,
    skip = 0,
    limit = 10
  ): Promise<{ rows: PresetRow[]; total: number }> {
    const data = await pool.query(
      `SELECT p.*, COUNT(*) OVER()::int AS total_count
       FROM presets p
       WHERE p.user_tblkey = $1
       ORDER BY p.preset_tblkey DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, skip]
    );

    const rows = data.rows as (PresetRow & { total_count: number })[];
    const total = rows.length ? rows[0].total_count : 0;

    return { rows, total };
  },

  async findById(userId: number, id: number): Promise<PresetRow | null> {
    const r = await pool.query(
      `SELECT * FROM presets WHERE preset_tblkey=$1 AND user_tblkey=$2`,
      [id, userId]
    );
    return r.rows[0] || null;
  },

  async update(
    userId: number,
    id: number,
    patch: Partial<{
      presetName: string;
      applicant: string;
      startDate: string;
      endDate: string;
      description: string | null;
    }>
  ): Promise<boolean> {
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;

    if (patch.presetName !== undefined) {
      sets.push(`preset_name=$${i++}`);
      vals.push(patch.presetName);
    }
    if (patch.applicant !== undefined) {
      sets.push(`applicant=$${i++}`);
      vals.push(patch.applicant);
    }
    if (patch.startDate !== undefined) {
      sets.push(`start_date=$${i++}`);
      vals.push(patch.startDate);
    }
    if (patch.endDate !== undefined) {
      sets.push(`end_date=$${i++}`);
      vals.push(patch.endDate);
    }
    if (patch.description !== undefined) {
      sets.push(`description=$${i++}`);
      vals.push(patch.description);
    }

    if (!sets.length) return false;

    vals.push(id, userId);

    const r = await pool.query(
      `UPDATE presets
       SET ${sets.join(", ")}
       WHERE preset_tblkey=$${i++} AND user_tblkey=$${i++}`,
      vals
    );

    return (r.rowCount ?? 0) > 0;
  },

  async remove(userId: number, id: number): Promise<boolean> {
    const r = await pool.query(
      `DELETE FROM presets WHERE preset_tblkey=$1 AND user_tblkey=$2`,
      [id, userId]
    );
    return (r.rowCount ?? 0) > 0;
  },
};
