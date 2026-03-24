import { Router } from "express";
import {
  createFavorite,
  listFavorites,
  getFavorite,
  deleteFavorite,
  updateFavorite,
  analyzeFavorites,
} from "../controllers/favoriteController";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { createFavoriteSchema, updateFavoriteSchema } from "../validators/favoriteSchemas";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createFavoriteSchema), createFavorite);
router.get("/", listFavorites);
router.get("/analysis", analyzeFavorites);
router.get("/:applicationNumber", getFavorite);
router.patch("/:applicationNumber", validate(updateFavoriteSchema), updateFavorite);
router.delete("/:applicationNumber", deleteFavorite);

export default router;
