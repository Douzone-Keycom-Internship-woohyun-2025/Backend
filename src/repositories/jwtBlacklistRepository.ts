import { pool } from "../config/db";

export const JwtBlacklistRepository = {
  async add(token: string, expiresAt: Date) {
    await pool.query(
      `INSERT INTO jwt_blacklist (token, expires_at)
      VALUES ($1, $2)
      ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [token, expiresAt]
    );
  },

  async isBlacklisted(token: string): Promise<boolean> {
    const { rows } = await pool.query(
      `SELECT 1 FROM jwt_blacklist 
     WHERE token = $1 AND expires_at > NOW() 
     LIMIT 1`,
      [token]
    );
    return rows.length > 0;
  },

  async purgeExpired() {
    await pool.query(`DELETE FROM jwt_blacklist WHERE expires_at <= NOW()`);
  },
};
