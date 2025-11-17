import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import authRoutes from "./routes/authRoutes";
import presetRoutes from "./routes/presetRoutes";
import summaryRoutes from "./routes/summaryRoutes";
import patentRoutes from "./routes/patentRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import { errorHandler } from "./middlewares/errorHandler";

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

app.use("/users", authRoutes);
app.use("/summary", summaryRoutes);
app.use("/patents", patentRoutes);
app.use("/presets", presetRoutes);
app.use("/favorites", favoriteRoutes);

app.use(errorHandler);

export default app;
