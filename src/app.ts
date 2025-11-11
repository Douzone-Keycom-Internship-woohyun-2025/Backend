import express from "express";
import cors from "cors";
import { pool } from "./config/db";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "성공", db: "연결" });
  } catch (error) {
    console.error("DB 연결 실패:", error);
    res.status(500).json({ status: "실패", db: "연결 실패" });
  }
});

export default app;
