import { pool } from "../config/db";

export const patentIpcSubclassRepository = {
  async addMappings(patentId: number, ipcList: string[]) {
    if (ipcList.length === 0) return;

    const valueRows = ipcList.map((_, idx) => `($1, $${idx + 2})`).join(", ");

    const query = `
      INSERT INTO patent_ipc_subclass_map (patent_tblkey, ipc_subclass)
      VALUES ${valueRows}
      ON CONFLICT DO NOTHING
    `;

    const values = [patentId, ...ipcList];

    console.log("IPC INSERT:", values);

    await pool.query(query, values);
  },

  async findByPatentId(patentId: number) {
    const query = `
      SELECT pim.ipc_subclass, ism.kor_name
      FROM patent_ipc_subclass_map pim
      LEFT JOIN ipc_subclass_map ism
        ON pim.ipc_subclass = ism.ipc_subclass
      WHERE pim.patent_tblkey = $1
    `;
    const result = await pool.query(query, [patentId]);
    return result.rows;
  },
};
