import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { kiprisLimiter } from "../middlewares/rateLimiter";
import {
  basicSearchSchema,
  advancedSearchSchema,
} from "../validators/patentSchemas";
import {
  basicSearch,
  advancedSearch,
  getPatentDetail,
} from "../controllers/patentController";

const router = Router();

router.post("/search/basic", requireAuth, kiprisLimiter, validate(basicSearchSchema), basicSearch);
router.post("/search/advanced", requireAuth, kiprisLimiter, validate(advancedSearchSchema), advancedSearch);
router.get("/:applicationNumber", requireAuth, kiprisLimiter, getPatentDetail);

export default router;
