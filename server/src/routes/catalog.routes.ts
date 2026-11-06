import { Router } from "express";
import { requireRole } from "../middleware/auth.ts";
import {
  archiveProduct,
  archiveService,
  createCategory,
  createProduct,
  createService,
  getProduct,
  getService,
  listCategories,
  listProducts,
  listServices,
  updateProduct,
  updateService,
} from "../controllers/catalog.controller.ts";

const router = Router();

// ---------------- Services ----------------

router.get("/services", listServices);
router.get("/services/:slug", getService);
router.post("/services", requireRole("ADMIN"), createService);
router.patch("/services/:id", requireRole("ADMIN"), updateService);
router.delete("/services/:id", requireRole("ADMIN"), archiveService);

// ---------------- Product categories ----------------

router.get("/categories", listCategories);
router.post("/categories", requireRole("ADMIN"), createCategory);

// ---------------- Products ----------------

router.get("/products", listProducts);
router.get("/products/:slug", getProduct);
router.post("/products", requireRole("ADMIN"), createProduct);
router.patch("/products/:id", requireRole("ADMIN"), updateProduct);
router.delete("/products/:id", requireRole("ADMIN"), archiveProduct);

export default router;
