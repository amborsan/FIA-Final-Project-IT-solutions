import { Router } from "express";
import { requireAuth } from "../middleware/auth.ts";
import {
  changePassword,
  deleteAccount,
  exportPersonalData,
  getProfile,
  listMyActivity,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateProfile,
} from "../controllers/profile.controller.ts";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);
router.post("/profile/password", requireAuth, changePassword);

// ---------------- Notifications ----------------

router.get("/notifications", requireAuth, listNotifications);
router.patch("/notifications/read-all", requireAuth, markAllNotificationsRead);
router.patch("/notifications/:id/read", requireAuth, markNotificationRead);
router.get("/profile/activity", requireAuth, listMyActivity);

// ---------------- GDPR tools ----------------

router.get("/privacy/export", requireAuth, exportPersonalData);
router.delete("/privacy/account", requireAuth, deleteAccount);

export default router;
