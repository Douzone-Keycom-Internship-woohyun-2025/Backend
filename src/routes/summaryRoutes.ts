import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getSummary, compareSummary } from "../controllers/summaryController";

const router = Router();

router.get("/compare", requireAuth, compareSummary);
router.get("/", requireAuth, getSummary);

export default router;
