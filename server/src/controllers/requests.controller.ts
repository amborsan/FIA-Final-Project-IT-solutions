import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import {
  assignSchema,
  publicRequestSchema,
  requestStatusSchema,
  staffRequestSchema,
} from "../validation/schemas.ts";
import { createReference } from "../utils/helpers.ts";
import { logActivity, notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

// A visitor or customer can ask for a quotation without an account.
export const createPublicRequest = asyncHandler(
  async (req, res) => {
    const input = publicRequestSchema.parse(req.body);

    if (input.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: input.serviceId },
      });
      if (!service) throw new AppError(400, "Selected service was not found.");
    }

    const request = await prisma.serviceRequest.create({
      data: {
        reference: createReference("SR"),
        customerId: req.user?.role === "CUSTOMER" ? req.user.id : null,
        serviceId: input.serviceId || null,
        title: input.title,
        description: input.description,
        siteAddress: input.siteAddress || null,
        preferredDate: input.preferredDate ?? null,
        budget: input.budget ?? null,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone || null,
        consentAt: new Date(),
      },
    });

    // Tell the admin team about the new request.
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New quote request",
          message: `${request.reference}: ${request.title}`,
          link: "/admin/requests",
        })),
      });
    }

    await logActivity(
      req.user?.id ?? null,
      "request.created",
      `Quote request ${request.reference} created`,
      "ServiceRequest",
      request.id,
    );

    res.status(201).json({ request, reference: request.reference });
  },
);

// Staff can create a request on behalf of a customer/lead.
export const createStaffRequest = asyncHandler(
  async (req, res) => {
    const input = staffRequestSchema.parse(req.body);
    const request = await prisma.serviceRequest.create({
      data: {
        reference: createReference("SR"),
        customerId: input.customerId || null,
        serviceId: input.serviceId || null,
        title: input.title,
        description: input.description,
        siteAddress: input.siteAddress || null,
        preferredDate: input.preferredDate ?? null,
        budget: input.budget ?? null,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone || null,
        consentAt: new Date(),
      },
    });
    res.status(201).json({ request });
  },
);

// List requests: customers see their own, technicians their assignments.
export const listRequests = asyncHandler(
  async (req, res) => {
    const where =
      req.user!.role === "ADMIN"
        ? {}
        : req.user!.role === "TECHNICIAN"
          ? { assignedTechnicianId: req.user!.id }
          : { customerId: req.user!.id };

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        service: true,
        customer: { select: publicUserSelect },
        technician: { select: publicUserSelect },
        quotes: {
          select: { id: true, reference: true, status: true, total: true },
        },
        _count: { select: { tickets: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ requests });
  },
);

export const getRequest = asyncHandler(async (req, res) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: req.params.id },
    include: {
      service: true,
      customer: { select: publicUserSelect },
      technician: { select: publicUserSelect },
      quotes: { include: { items: true } },
      appointments: true,
      tickets: true,
      reports: {
        include: { technician: { select: publicUserSelect } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) throw new AppError(404, "Request not found.");
  const allowed =
    req.user!.role === "ADMIN" ||
    request.customerId === req.user!.id ||
    request.assignedTechnicianId === req.user!.id;
  if (!allowed) throw new AppError(403, "You cannot view this request.");

  res.json({ request });
});

// Admin assigns a technician and/or links the request to a customer account.
export const assignRequest = asyncHandler(
  async (req, res) => {
    const input = assignSchema.parse(req.body);

    if (input.technicianId) {
      const technician = await prisma.user.findUnique({
        where: { id: input.technicianId },
      });
      if (!technician || technician.role !== "TECHNICIAN" || technician.deletedAt) {
        throw new AppError(400, "Technician not found.");
      }
    }
    if (input.customerId) {
      const customer = await prisma.user.findUnique({
        where: { id: input.customerId },
      });
      if (!customer || customer.deletedAt) {
        throw new AppError(400, "Customer not found.");
      }
    }

    const request = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: {
        ...(input.technicianId !== undefined
          ? { assignedTechnicianId: input.technicianId }
          : {}),
        ...(input.customerId !== undefined
          ? { customerId: input.customerId }
          : {}),
      },
      include: { technician: { select: publicUserSelect } },
    });

    if (input.technicianId) {
      await notifyUser(
        input.technicianId,
        "New task assigned",
        `${request.reference}: ${request.title}`,
        "/technician",
      );
    }
    await logActivity(
      req.user!.id,
      "request.updated",
      `Assignments updated for ${request.reference}`,
      "ServiceRequest",
      request.id,
    );

    res.json({ request });
  },
);

// Technicians can update their own tasks. Admins can update any request.
export const updateRequestStatus = asyncHandler(
  async (req, res) => {
    const input = requestStatusSchema.parse(req.body);
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new AppError(404, "Request not found.");
    if (
      req.user!.role === "TECHNICIAN" &&
      existing.assignedTechnicianId !== req.user!.id
    ) {
      throw new AppError(403, "This request is not assigned to you.");
    }

    const request = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status: input.status },
    });

    if (request.customerId) {
      await notifyUser(
        request.customerId,
        "Request status updated",
        `${request.reference} is now ${input.status.replaceAll("_", " ").toLowerCase()}.`,
        `/portal/requests/${request.id}`,
      );
    }
    await logActivity(
      req.user!.id,
      "request.status",
      `${request.reference} changed to ${input.status}`,
      "ServiceRequest",
      request.id,
    );

    res.json({ request });
  },
);

// A customer may cancel a request while it is still being reviewed.
export const cancelRequest = asyncHandler(
  async (req, res) => {
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new AppError(404, "Request not found.");
    if (existing.customerId !== req.user!.id) {
      throw new AppError(403, "You cannot cancel this request.");
    }
    if (!["NEW", "REVIEWING", "QUOTED"].includes(existing.status)) {
      throw new AppError(400, "This request can no longer be cancelled online.");
    }

    const request = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });
    res.json({ request });
  },
);
