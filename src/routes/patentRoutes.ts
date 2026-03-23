import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
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

router.post("/search/basic", requireAuth, validate(basicSearchSchema), basicSearch);
router.post("/search/advanced", requireAuth, validate(advancedSearchSchema), advancedSearch);
router.get("/:applicationNumber", requireAuth, getPatentDetail);

export default router;
