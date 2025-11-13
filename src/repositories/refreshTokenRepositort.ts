import { pool } from "../config/db";

export const RefreshTokenRepository = {
  async save(token: string, email: string, expiresAt: Date) {
    await pool.query(
      `
      INSERT INTO refresh_tokens (token, email, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (token)
      DO UPDATE SET email = EXCLUDED.email, expires_at = EXCLUDED.expires_at
      `,
      [token, email, expiresAt]
    );
  },

  async find(token: string) {
    const r = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()`,
      [token]
    );
    return r.rows[0] || null;
  },

  async delete(token: string) {
    await pool.query(`DELETE FROM refresh_tokens WHERE token=$1`, [token]);
  },
};
