import { Router } from "express";
import { signup, login, logout, refresh } from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
