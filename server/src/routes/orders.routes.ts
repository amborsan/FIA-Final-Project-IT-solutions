import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
  createOrder,
  getOrder,
  listInvoices,
  listOrders,
  payInvoice,
  updateOrderStatus,
} from "../controllers/orders.controller.ts";

const router = Router();

// Customers can order products directly from the store.
router.post("/orders", requireRole("CUSTOMER"), createOrder);
router.get("/orders", requireAuth, listOrders);
router.get("/orders/:id", requireAuth, getOrder);
router.patch("/orders/:id/status", requireRole("ADMIN"), updateOrderStatus);

// ---------------- Invoices ----------------

router.get("/invoices", requireAuth, listInvoices);
router.patch("/invoices/:id/pay", requireRole("ADMIN"), payInvoice);

export default router;
