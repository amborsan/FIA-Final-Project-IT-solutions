import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import { formLimiter } from "../middleware/rateLimits.ts";
import {
  closeConversation,
  createConversation,
  getConversation,
  getGuestChat,
  listConversations,
  postConversationMessage,
  postGuestMessage,
  startGuestChat,
} from "../controllers/chat.controller.ts";

const router = Router();

// ---------------- Guest chat (no account needed) ----------------

router.post("/chat/guest", formLimiter, startGuestChat);
router.get("/chat/guest/:id", getGuestChat);
router.post("/chat/guest/:id/messages", formLimiter, postGuestMessage);

// ---------------- Authenticated chat ----------------

router.get("/chat/conversations", requireAuth, listConversations);
router.post("/chat/conversations", requireAuth, createConversation);
router.get("/chat/conversations/:id", requireAuth, getConversation);
router.post(
  "/chat/conversations/:id/messages",
  requireAuth,
  postConversationMessage,
);
router.patch(
  "/chat/conversations/:id/close",
  requireRole("ADMIN"),
  closeConversation,
);

export default router;
