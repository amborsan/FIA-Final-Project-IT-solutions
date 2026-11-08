import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
  addTicketMessage,
  assignTicket,
  createTicket,
  getTicket,
  listTickets,
  updateTicketStatus,
} from "../controllers/tickets.controller.ts";

const router = Router();

router.post("/tickets", requireRole("CUSTOMER", "ADMIN"), createTicket);
router.get("/tickets", requireAuth, listTickets);
router.get("/tickets/:id", requireAuth, getTicket);
router.post("/tickets/:id/messages", requireAuth, addTicketMessage);
router.patch(
  "/tickets/:id/status",
  requireRole("ADMIN", "TECHNICIAN"),
  updateTicketStatus,
);
router.patch("/tickets/:id/assign", requireRole("ADMIN"), assignTicket);

export default router;
