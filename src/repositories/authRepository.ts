import { pool } from "../config/db";

export interface User {
  user_tblkey: number;
  email: string;
  password_hash: string;
  adddate: string;
}

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT user_tblkey, email, password_hash, adddate FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  },

  async create(email: string, hashedPassword: string): Promise<User> {
    const result = await pool.query<User>(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING user_tblkey, email, password_hash, adddate
      `,
      [email, hashedPassword]
    );
    return result.rows[0];
  },
};
