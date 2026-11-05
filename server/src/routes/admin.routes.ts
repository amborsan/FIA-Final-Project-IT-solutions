import { Router } from "express";
import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { requireRole } from "../middleware/auth.ts";
import {
  adminUserSchema,
  adminUserUpdateSchema,
} from "../validation/schemas.ts";
import { hashPassword } from "../auth/password.ts";
import { publicUserSelect } from "../auth/session.ts";
import { logActivity } from "../utils/activity.ts";

const router = Router();

// Every route below is for admins only.
router.use(requireRole("ADMIN"));

// ---------------- Dashboard statistics ----------------

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [
      users,
      customers,
      technicians,
      openRequests,
      openTickets,
      orders,
      revenue,
      lowStock,
      recentRequests,
      recentTickets,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null } }),
      prisma.user.count({ where: { role: "TECHNICIAN", deletedAt: null } }),
      prisma.serviceRequest.count({
        where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      }),
      prisma.ticket.count({
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED"] } },
      }),
      prisma.product.count({ where: { active: true, stock: { lte: 3 } } }),
      prisma.serviceRequest.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          service: { select: { nameEn: true, nameDe: true } },
          customer: { select: { fullName: true } },
        },
      }),
      prisma.ticket.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { fullName: true } } },
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true, role: true } } },
      }),
    ]);

    res.json({
      stats: {
        users,
        customers,
        technicians,
        openRequests,
        openTickets,
        orders,
        revenue: revenue._sum.total ?? 0,
        lowStock,
      },
      recentRequests,
      recentTickets,
      recentActivity,
    });
  }),
);

// ---------------- Team and customers ----------------

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const role = String(req.query.role || "");
    const search = String(req.query.q || "").trim();

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as "ADMIN" | "TECHNICIAN" | "CUSTOMER" } : {}),
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
                { companyName: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  }),
);

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    const input = adminUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        fullName: `${input.firstName} ${input.lastName}`.trim(),
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        phone: input.phone || null,
        companyName: input.companyName || null,
        address: input.address || null,
      },
      select: publicUserSelect,
    });
    await logActivity(
      req.user!.id,
      "user.created",
      `Created ${user.role.toLowerCase()} account for ${user.fullName}`,
      "User",
      user.id,
    );

    res.status(201).json({ user });
  }),
);

router.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const input = adminUserUpdateSchema.parse(req.body);
    if (req.params.id === req.user!.id && input.role && input.role !== "ADMIN") {
      throw new AppError(400, "You cannot remove your own admin role.");
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(input.role ? { role: input.role } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.companyName !== undefined
          ? { companyName: input.companyName || null }
          : {}),
        ...(input.address !== undefined ? { address: input.address || null } : {}),
        ...(input.active === true ? { deletedAt: null } : {}),
        ...(input.active === false ? { deletedAt: new Date() } : {}),
      },
      select: publicUserSelect,
    });
    res.json({ user });
  }),
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.id) {
      throw new AppError(400, "You cannot delete your own account here.");
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await logActivity(
      req.user!.id,
      "user.deactivated",
      `Deactivated ${user.fullName}`,
      "User",
      user.id,
    );
    res.json({ message: "Account deactivated." });
  }),
);

// ---------------- Contact inbox and activity ----------------

router.get(
  "/contacts",
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ messages });
  }),
);

router.patch(
  "/contacts/:id",
  asyncHandler(async (req, res) => {
    const status = String(req.body.status || "");
    if (!["NEW", "READ", "REPLIED"].includes(status)) {
      throw new AppError(400, "Invalid status.");
    }
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status: status as "NEW" | "READ" | "REPLIED" },
    });
    res.json({ message });
  }),
);

router.get(
  "/activity",
  asyncHandler(async (_req, res) => {
    const activity = await prisma.activityLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: { select: publicUserSelect } },
    });
    res.json({ activity });
  }),
);

export default router;
