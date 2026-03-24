import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { kiprisLimiter } from "../middlewares/rateLimiter";
import { getSummary, compareSummary } from "../controllers/summaryController";

const router = Router();

router.get("/compare", requireAuth, kiprisLimiter, compareSummary);
router.get("/", requireAuth, kiprisLimiter, getSummary);

export default router;
