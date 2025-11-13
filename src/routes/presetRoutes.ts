import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import {
  createPresetSchema,
  updatePresetSchema,
} from "../validators/presetSchemas";
import {
  createPreset,
  listPresets,
  getPreset,
  updatePreset,
  deletePreset,
} from "../controllers/presetController";

const router = Router();
router.use(requireAuth);

router.post("/", validate(createPresetSchema), createPreset);
router.get("/", listPresets);
router.get("/:presetId", getPreset);
router.put("/:presetId", validate(updatePresetSchema), updatePreset);
router.delete("/:presetId", deletePreset);

export default router;
