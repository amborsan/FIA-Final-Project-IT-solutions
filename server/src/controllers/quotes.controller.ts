import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { quoteSchema } from "../validation/schemas.ts";
import {
  calculateTotals,
  createReference,
  daysFromNow,
} from "../utils/helpers.ts";
import { logActivity, notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

export const listQuotes = asyncHandler(async (req, res) => {
  const where =
    req.user!.role === "ADMIN"
      ? {}
      : req.user!.role === "CUSTOMER"
        ? { customerId: req.user!.id }
        : { request: { assignedTechnicianId: req.user!.id } };

  const quotes = await prisma.quote.findMany({
    where,
    include: {
      items: true,
      request: { select: { id: true, reference: true, title: true, status: true } },
      customer: { select: publicUserSelect },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ quotes });
});

export const getQuote = asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      request: true,
      customer: { select: publicUserSelect },
      order: true,
    },
  });
  if (!quote) throw new AppError(404, "Quote not found.");

  const allowed =
    req.user!.role === "ADMIN" ||
    quote.customerId === req.user!.id ||
    quote.request.assignedTechnicianId === req.user!.id;
  if (!allowed) throw new AppError(403, "You cannot view this quote.");

  res.json({ quote });
});

// Admin creates a quote for a request that is linked to a customer.
export const createQuote = asyncHandler(async (req, res) => {
  const input = quoteSchema.parse(req.body);

  const request = await prisma.serviceRequest.findUnique({
    where: { id: input.requestId },
  });
  if (!request) throw new AppError(404, "Request not found.");
  if (!request.customerId) {
    throw new AppError(
      400,
      "Link this request to a customer account before creating a quote.",
    );
  }

  const totals = calculateTotals(input.items, input.taxRate);
  const quote = await prisma.quote.create({
    data: {
      reference: createReference("Q"),
      requestId: request.id,
      customerId: request.customerId,
      createdById: req.user!.id,
      validUntil: input.validUntil,
      notes: input.notes || null,
      taxRate: input.taxRate,
      ...totals,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.serviceRequest.update({
    where: { id: request.id },
    data: { status: "QUOTED" },
  });
  await logActivity(
    req.user!.id,
    "quote.created",
    `Quote ${quote.reference} created`,
    "Quote",
    quote.id,
  );

  res.status(201).json({ quote });
});

// Sending the quote makes it visible to the customer.
export const sendQuote = asyncHandler(async (req, res) => {
  const existing = await prisma.quote.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "Quote not found.");
  if (existing.status !== "DRAFT") {
    throw new AppError(400, "Only draft quotes can be sent.");
  }

  const quote = await prisma.quote.update({
    where: { id: existing.id },
    data: { status: "SENT", sentAt: new Date() },
  });
  await prisma.serviceRequest.update({
    where: { id: quote.requestId },
    data: { status: "QUOTED" },
  });
  await notifyUser(
    quote.customerId,
    "New quote available",
    `${quote.reference} is ready for review.`,
    `/portal/requests/${quote.requestId}`,
  );

  res.json({ quote });
});

// The customer accepts the quote. This creates the order and invoice.
export const acceptQuote = asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: { items: true, request: true },
  });
  if (!quote) throw new AppError(404, "Quote not found.");
  if (quote.customerId !== req.user!.id) {
    throw new AppError(403, "You cannot accept this quote.");
  }
  if (quote.status !== "SENT") {
    throw new AppError(400, "This quote cannot be accepted.");
  }
  if (quote.validUntil < new Date()) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "EXPIRED" },
    });
    throw new AppError(400, "This quote has expired.");
  }

  const orderReference = createReference("ORD");
  const invoiceNumber = createReference("INV");

  const order = await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quote.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    await tx.serviceRequest.update({
      where: { id: quote.requestId },
      data: { status: "APPROVED" },
    });

    const created = await tx.order.create({
      data: {
        reference: orderReference,
        customerId: quote.customerId,
        quoteId: quote.id,
        status: "CONFIRMED",
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        shippingAddress: quote.request.siteAddress,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    await tx.invoice.create({
      data: {
        number: invoiceNumber,
        orderId: created.id,
        customerId: quote.customerId,
        amount: quote.total,
        dueAt: daysFromNow(14),
      },
    });

    // Reduce stock for products that were part of the quote.
    for (const item of quote.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return created;
  });

  await logActivity(
    req.user!.id,
    "quote.accepted",
    `Quote ${quote.reference} accepted`,
    "Quote",
    quote.id,
  );
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  for (const admin of admins) {
    await notifyUser(
      admin.id,
      "Quote accepted",
      `${quote.reference} was accepted. Order ${order.reference} created.`,
      "/admin/orders",
    );
  }

  res.json({ order });
});

export const rejectQuote = asyncHandler(async (req, res) => {
  const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
  if (!quote) throw new AppError(404, "Quote not found.");
  if (quote.customerId !== req.user!.id) {
    throw new AppError(403, "You cannot reject this quote.");
  }
  if (quote.status !== "SENT") {
    throw new AppError(400, "This quote cannot be rejected.");
  }

  const updated = await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "REJECTED" },
  });
  await prisma.serviceRequest.update({
    where: { id: quote.requestId },
    data: { status: "REVIEWING" },
  });
  await logActivity(
    req.user!.id,
    "quote.rejected",
    `Quote ${quote.reference} rejected`,
    "Quote",
    quote.id,
  );

  res.json({ quote: updated });
});
