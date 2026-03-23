import { Router } from "express";
import { signup, login, logout, refresh } from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validate";
import {
  signupSchema,
  loginSchema,
  refreshSchema,
} from "../validators/authSchemas";

const router = Router();

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", authLimiter, validate(refreshSchema), refresh);
router.post("/logout", validate(refreshSchema), logout);

export default router;
