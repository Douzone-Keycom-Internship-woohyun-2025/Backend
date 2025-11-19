import app from "./app";
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

  app.listen(PORT, () => {
    console.log(`TechLens backend running on port ${PORT}`);
  });
})();
