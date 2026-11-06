import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { productSchema, serviceSchema } from "../validation/schemas.ts";

// ---------------- Services ----------------

export const listServices = asyncHandler(
  async (req, res) => {
    const includeInactive =
      req.user?.role === "ADMIN" && req.query.all === "true";
    const services = await prisma.service.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    });
    res.json({ services });
  },
);

export const getService = asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
  });
  if (!service || (!service.active && req.user?.role !== "ADMIN")) {
    throw new AppError(404, "Service not found.");
  }
  res.json({ service });
});

export const createService = asyncHandler(
  async (req, res) => {
    const input = serviceSchema.parse(req.body);
    const service = await prisma.service.create({
      data: { ...input, startingPrice: input.startingPrice ?? null },
    });
    res.status(201).json({ service });
  },
);

export const updateService = asyncHandler(
  async (req, res) => {
    const input = serviceSchema.partial().parse(req.body);
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { ...input, startingPrice: input.startingPrice ?? undefined },
    });
    res.json({ service });
  },
);

export const archiveService = asyncHandler(
  async (req, res) => {
    await prisma.service.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: "Service archived." });
  },
);

// ---------------- Product categories ----------------

export const listCategories = asyncHandler(
  async (_req, res) => {
    const categories = await prisma.productCategory.findMany({
      orderBy: { nameEn: "asc" },
    });
    res.json({ categories });
  },
);

export const createCategory = asyncHandler(
  async (req, res) => {
    const category = await prisma.productCategory.create({
      data: {
        slug: String(req.body.slug),
        nameEn: String(req.body.nameEn),
        nameDe: String(req.body.nameDe),
      },
    });
    res.status(201).json({ category });
  },
);

// ---------------- Products ----------------

export const listProducts = asyncHandler(
  async (req, res) => {
    const search = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    const featured = req.query.featured === "true";
    const includeInactive =
      req.user?.role === "ADMIN" && req.query.all === "true";

    const products = await prisma.product.findMany({
      where: {
        ...(includeInactive ? {} : { active: true }),
        ...(featured ? { featured: true } : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search, mode: "insensitive" as const } },
                { nameDe: { contains: search, mode: "insensitive" as const } },
                { sku: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { nameEn: "asc" }],
    });
    res.json({ products });
  },
);

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true },
  });
  if (!product || (!product.active && req.user?.role !== "ADMIN")) {
    throw new AppError(404, "Product not found.");
  }
  res.json({ product });
});

export const createProduct = asyncHandler(
  async (req, res) => {
    const input = productSchema.parse(req.body);
    const product = await prisma.product.create({ data: input });
    res.status(201).json({ product });
  },
);

export const updateProduct = asyncHandler(
  async (req, res) => {
    const input = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: input,
    });
    res.json({ product });
  },
);

export const archiveProduct = asyncHandler(
  async (req, res) => {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ message: "Product archived." });
  },
);
