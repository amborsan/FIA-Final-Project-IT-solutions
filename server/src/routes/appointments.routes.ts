import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "../controllers/appointments.controller.ts";

const router = Router();

router.get("/appointments", requireAuth, listAppointments);
router.post(
  "/appointments",
  requireRole("ADMIN", "TECHNICIAN"),
  createAppointment,
);
router.patch(
  "/appointments/:id/status",
  requireAuth,
  updateAppointmentStatus,
);

export default router;
