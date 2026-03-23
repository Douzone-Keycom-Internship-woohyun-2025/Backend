import { pool } from "../config/db";

export class IpcSubclassDictionary {
  private static cache: Record<string, string> = {};

  static async loadCache() {
    const result = await pool.query(
      "SELECT ipc_subclass, kor_name FROM ipc_subclass_map"
    );
    this.cache = {};
    result.rows.forEach((row) => {
      this.cache[row.ipc_subclass] = row.kor_name;
    });
  }

  static getKorName(ipcSubclass: string): string | undefined {
    return this.cache[ipcSubclass];
  }
}
