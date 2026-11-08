import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import { formLimiter } from "../middleware/rateLimits.ts";
import {
  assignRequest,
  cancelRequest,
  createPublicRequest,
  createStaffRequest,
  getRequest,
  listRequests,
  updateRequestStatus,
} from "../controllers/requests.controller.ts";

const router = Router();

// A visitor or customer can ask for a quotation without an account.
router.post("/requests/public", formLimiter, createPublicRequest);

// Staff can create a request on behalf of a customer/lead.
router.post("/requests", requireRole("ADMIN"), createStaffRequest);

// List requests: customers see their own, technicians their assignments.
router.get("/requests", requireAuth, listRequests);
router.get("/requests/:id", requireAuth, getRequest);

// Admin assigns a technician and/or links the request to a customer account.
router.patch("/requests/:id/assign", requireRole("ADMIN"), assignRequest);

// Technicians can update their own tasks. Admins can update any request.
router.patch(
  "/requests/:id/status",
  requireRole("ADMIN", "TECHNICIAN"),
  updateRequestStatus,
);

// A customer may cancel a request while it is still being reviewed.
router.post("/requests/:id/cancel", requireRole("CUSTOMER"), cancelRequest);

export default router;
