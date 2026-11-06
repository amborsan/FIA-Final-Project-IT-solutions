import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
  acceptQuote,
  createQuote,
  getQuote,
  listQuotes,
  rejectQuote,
  sendQuote,
} from "../controllers/quotes.controller.ts";

const router = Router();

router.get("/quotes", requireAuth, listQuotes);
router.get("/quotes/:id", requireAuth, getQuote);

// Admin creates a quote for a request that is linked to a customer.
router.post("/quotes", requireRole("ADMIN"), createQuote);

// Sending the quote makes it visible to the customer.
router.post("/quotes/:id/send", requireRole("ADMIN"), sendQuote);

// The customer accepts the quote. This creates the order and invoice.
router.post("/quotes/:id/accept", requireRole("CUSTOMER"), acceptQuote);
router.post("/quotes/:id/reject", requireRole("CUSTOMER"), rejectQuote);

export default router;
