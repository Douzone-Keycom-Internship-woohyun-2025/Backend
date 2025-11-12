import { Router } from "express";
import { signup, login, logout } from "../controllers/authController";
import { requireAuth } from "../middlewares/requireAuth";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", requireAuth, logout);

export default router;
