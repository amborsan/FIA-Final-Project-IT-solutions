import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import { reportUpload } from "../middleware/reportUpload.ts";
import {
  approveReport,
  createReport,
  downloadReportFile,
  listReports,
} from "../controllers/reports.controller.ts";

const router = Router();

router.get("/reports", requireAuth, listReports);
router.post(
  "/reports",
  requireRole("TECHNICIAN", "ADMIN"),
  reportUpload.single("file"),
  createReport,
);
router.patch("/reports/:id/approve", requireRole("ADMIN"), approveReport);
router.get("/reports/:id/file", requireAuth, downloadReportFile);

export default router;
