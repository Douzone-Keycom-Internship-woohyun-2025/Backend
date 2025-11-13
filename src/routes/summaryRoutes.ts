import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getSummary } from "../controllers/summaryController";

const router = Router();

router.get("/", requireAuth, getSummary);

export default router;
