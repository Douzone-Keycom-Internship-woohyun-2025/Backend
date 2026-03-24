import { Pool } from "pg";
import { DATABASE_URL } from "./env";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false },
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("Unexpected idle client error:", err.message);
});

// Neon DB 무료 티어 idle 연결 끊김 방지 — 4분마다 경량 쿼리
const KEEP_ALIVE_INTERVAL = 4 * 60 * 1000;

setInterval(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("[DB] keep-alive failed:", (err as Error).message);
  }
}, KEEP_ALIVE_INTERVAL);
