import { Router } from "express";
import { requireRole } from "../middleware/auth.ts";
import {
  createUser,
  deactivateUser,
  getDashboardStats,
  listActivityLogs,
  listContactMessages,
  listUsers,
  updateContactMessage,
  updateUser,
} from "../controllers/admin.controller.ts";

const router = Router();

// Every route below is for admins only.
router.use(requireRole("ADMIN"));

// ---------------- Dashboard statistics ----------------

router.get("/stats", getDashboardStats);

// ---------------- Team and customers ----------------

router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deactivateUser);

// ---------------- Contact inbox and activity ----------------

router.get("/contacts", listContactMessages);
router.patch("/contacts/:id", updateContactMessage);
router.get("/activity", listActivityLogs);

export default router;
