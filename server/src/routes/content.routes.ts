import { Router } from "express";
import { requireRole } from "../middleware/auth.ts";
import {
  adminCreateContent,
  adminDeleteContent,
  adminListContent,
  adminUpdateContent,
  getContent,
  listContent,
} from "../controllers/content.controller.ts";

const router = Router();

// Published articles are public. Drafts are only visible to admins.
router.get("/content", listContent);
router.get("/content/:slug", getContent);

// ---------------- Admin CMS ----------------

router.get("/admin/content", requireRole("ADMIN"), adminListContent);
router.post("/admin/content", requireRole("ADMIN"), adminCreateContent);
router.patch("/admin/content/:id", requireRole("ADMIN"), adminUpdateContent);
router.delete("/admin/content/:id", requireRole("ADMIN"), adminDeleteContent);

export default router;
