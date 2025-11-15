import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  basicSearch,
  advancedSearch,
  getPatentDetail,
} from "../controllers/patentController";

const router = Router();

router.post("/search/basic", requireAuth, basicSearch);
router.post("/search/advanced", requireAuth, advancedSearch);
router.get("/:applicationNumber", requireAuth, getPatentDetail);

export default router;
