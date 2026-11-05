import { Router } from "express";
import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
  ticketMessageSchema,
  ticketSchema,
  ticketStatusSchema,
} from "../validation/schemas.ts";
import { createReference } from "../utils/helpers.ts";
import { logActivity, notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

const router = Router();

router.post(
  "/tickets",
  requireRole("CUSTOMER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const input = ticketSchema.parse(req.body);
    const customerId = req.user!.role === "CUSTOMER" ? req.user!.id : req.body.customerId;
    if (!customerId) throw new AppError(400, "Customer is required.");

    const ticket = await prisma.ticket.create({
      data: {
        reference: createReference("TK"),
        customerId,
        requestId: input.requestId || null,
        subject: input.subject,
        description: input.description,
        category: input.category || null,
        priority: input.priority,
        messages: {
          create: {
            authorId: req.user!.id,
            body: input.description,
          },
        },
      },
      include: { messages: true },
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    for (const admin of admins) {
      await notifyUser(
        admin.id,
        "New support ticket",
        `${ticket.reference}: ${ticket.subject}`,
        "/admin/tickets",
      );
    }
    await logActivity(
      req.user!.id,
      "ticket.created",
      `Ticket ${ticket.reference} created`,
      "Ticket",
      ticket.id,
    );

    res.status(201).json({ ticket });
  }),
);

router.get(
  "/tickets",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where =
      req.user!.role === "ADMIN"
        ? {}
        : req.user!.role === "TECHNICIAN"
          ? { assignedTechnicianId: req.user!.id }
          : { customerId: req.user!.id };

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: { select: publicUserSelect },
        technician: { select: publicUserSelect },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    res.json({ tickets });
  }),
);

router.get(
  "/tickets/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: publicUserSelect },
        technician: { select: publicUserSelect },
        request: { select: { id: true, reference: true, title: true } },
        messages: {
          where:
            req.user!.role === "CUSTOMER" ? { isInternal: false } : {},
          include: { author: { select: publicUserSelect } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!ticket) throw new AppError(404, "Ticket not found.");

    const allowed =
      req.user!.role === "ADMIN" ||
      ticket.customerId === req.user!.id ||
      ticket.assignedTechnicianId === req.user!.id;
    if (!allowed) throw new AppError(403, "You cannot view this ticket.");

    res.json({ ticket });
  }),
);

router.post(
  "/tickets/:id/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = ticketMessageSchema.parse(req.body);
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) throw new AppError(404, "Ticket not found.");

    const isCustomer = ticket.customerId === req.user!.id;
    const isStaff =
      req.user!.role === "ADMIN" ||
      ticket.assignedTechnicianId === req.user!.id;
    if (!isCustomer && !isStaff) {
      throw new AppError(403, "You cannot reply to this ticket.");
    }
    if (input.isInternal && isCustomer) {
      throw new AppError(403, "Customers cannot write internal notes.");
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: req.user!.id,
        body: input.body,
        isInternal: Boolean(input.isInternal),
      },
      include: { author: { select: publicUserSelect } },
    });

    // Keep the status useful: a customer reply reopens work, staff replies wait.
    if (!input.isInternal) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: isCustomer ? "IN_PROGRESS" : "WAITING_CUSTOMER" },
      });
    }

    if (isCustomer) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", deletedAt: null },
        select: { id: true },
      });
      for (const admin of admins) {
        await notifyUser(
          admin.id,
          "Ticket reply",
          `${ticket.reference}: ${input.body.slice(0, 80)}`,
          "/admin/tickets",
        );
      }
    } else {
      await notifyUser(
        ticket.customerId,
        "Support replied",
        `${ticket.reference}: ${input.body.slice(0, 80)}`,
        `/portal/tickets/${ticket.id}`,
      );
    }

    res.status(201).json({ message });
  }),
);

router.patch(
  "/tickets/:id/status",
  requireRole("ADMIN", "TECHNICIAN"),
  asyncHandler(async (req, res) => {
    const input = ticketStatusSchema.parse(req.body);
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) throw new AppError(404, "Ticket not found.");
    if (
      req.user!.role === "TECHNICIAN" &&
      ticket.assignedTechnicianId !== req.user!.id
    ) {
      throw new AppError(403, "This ticket is not assigned to you.");
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: input.status },
    });
    await notifyUser(
      ticket.customerId,
      "Ticket status updated",
      `${ticket.reference} is now ${input.status.replaceAll("_", " ").toLowerCase()}.`,
      `/portal/tickets/${ticket.id}`,
    );
    await logActivity(
      req.user!.id,
      "ticket.status",
      `${ticket.reference} changed to ${input.status}`,
      "Ticket",
      ticket.id,
    );

    res.json({ ticket: updated });
  }),
);

router.patch(
  "/tickets/:id/assign",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const { technicianId } = req.body as { technicianId?: string | null };
    if (technicianId) {
      const technician = await prisma.user.findUnique({ where: { id: technicianId } });
      if (!technician || technician.role !== "TECHNICIAN") {
        throw new AppError(400, "Technician not found.");
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { assignedTechnicianId: technicianId || null },
    });
    if (technicianId) {
      await notifyUser(
        technicianId,
        "New ticket assigned",
        `${ticket.reference}: ${ticket.subject}`,
        "/technician",
      );
    }
    res.json({ ticket });
  }),
);

export default router;
