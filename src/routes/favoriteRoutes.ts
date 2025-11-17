import { Router } from "express";
import {
  createFavorite,
  listFavorites,
  getFavorite,
  deleteFavorite,
} from "../controllers/favoriteController";
import { requireAuth } from "../middlewares/requireAuth";
import { validate } from "../middlewares/validate";
import { createFavoriteSchema } from "../validators/favoriteSchemas";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createFavoriteSchema), createFavorite);
router.get("/", listFavorites);
router.get("/:applicationNumber", getFavorite);
router.delete("/:applicationNumber", deleteFavorite);

export default router;
