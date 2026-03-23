import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pool } from "./config/db";
import authRoutes from "./routes/authRoutes";
import presetRoutes from "./routes/presetRoutes";
import summaryRoutes from "./routes/summaryRoutes";
import patentRoutes from "./routes/patentRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { apiLimiter } from "./middlewares/rateLimiter";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL_DEV,
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_VERCEL,
  process.env.FRONTEND_URL_STAGING,
].filter(Boolean) as string[];

if (allowedOrigins.length === 0) {
  console.error("[CORS] 허용된 origin이 없습니다. FRONTEND_URL_* 환경변수를 확인하세요.");
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

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
app.use("/summary", apiLimiter, summaryRoutes);
app.use("/patents", apiLimiter, patentRoutes);
app.use("/presets", apiLimiter, presetRoutes);
app.use("/favorites", apiLimiter, favoriteRoutes);

app.use(errorHandler);

export default app;
