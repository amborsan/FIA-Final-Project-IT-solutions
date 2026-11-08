import { Router } from "express";
import { formLimiter } from "../middleware/rateLimits.ts";
import { getHealth, submitContact } from "../controllers/public.controller.ts";

const router = Router();

router.get("/health", getHealth);
router.post("/contact", formLimiter, submitContact);

export default router;
