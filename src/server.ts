import app from "./app";
import { pool } from "./config/db";
import { IpcSubclassDictionary } from "./repositories/ipcSubclassDictionary";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await IpcSubclassDictionary.loadCache();
    console.log("IPC 캐시 초기화 완료");
  } catch (error) {
    console.error("IPC 캐시 초기화 실패:", error);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`TechLens backend running on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[${signal}] Graceful shutdown 시작...`);

    server.close(async () => {
      console.log("HTTP 서버 종료 완료");
      await pool.end();
      console.log("DB 커넥션 풀 종료 완료");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Graceful shutdown 시간 초과, 강제 종료");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
