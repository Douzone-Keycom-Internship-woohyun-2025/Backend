import { Router } from "express";
import { signup, login, logout, refresh } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);

export default router;
