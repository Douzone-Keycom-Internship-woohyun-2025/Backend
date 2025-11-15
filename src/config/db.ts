import { Pool } from "pg";
import { DATABASE_URL } from "./env";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 프로덕션 환경에 맞게 조정
  },
});
