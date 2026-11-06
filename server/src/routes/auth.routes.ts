import { Router } from "express";
import { authLimiter } from "../middleware/rateLimits.ts";
import {
  getCsrfToken,
  getCurrentUser,
  login,
  logout,
  register,
} from "../controllers/auth.controller.ts";

const router = Router();

router.get("/csrf", getCsrfToken);
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

export default router;
