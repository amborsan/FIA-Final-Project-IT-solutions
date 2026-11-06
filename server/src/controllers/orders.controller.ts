import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { orderSchema, orderStatusSchema } from "../validation/schemas.ts";
import {
  calculateTotals,
  createReference,
  daysFromNow,
} from "../utils/helpers.ts";
import { logActivity, notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

// Customers can order products directly from the store.
export const createOrder = asyncHandler(
  async (req, res) => {
    const input = orderSchema.parse(req.body);

    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) }, active: true },
    });
    if (products.length !== input.items.length) {
      throw new AppError(400, "One or more products are no longer available.");
    }

    const items = input.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new AppError(400, `Not enough stock for ${product.nameEn}.`);
      }
      return {
        productId: product.id,
        description: product.nameEn,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        total: Number(product.price) * item.quantity,
      };
    });

    const totals = calculateTotals(items, 19);
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          reference: createReference("ORD"),
          customerId: req.user!.id,
          shippingAddress: input.shippingAddress,
          notes: input.notes || null,
          termsAcceptedAt: new Date(),
          taxRate: 19,
          ...totals,
          items: { create: items },
        },
        include: { items: true },
      });

      await tx.invoice.create({
        data: {
          number: createReference("INV"),
          orderId: created.id,
          customerId: req.user!.id,
          amount: totals.total,
          dueAt: daysFromNow(14),
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    for (const admin of admins) {
      await notifyUser(
        admin.id,
        "New product order",
        `${order.reference} was placed.`,
        "/admin/orders",
      );
    }
    await logActivity(
      req.user!.id,
      "order.created",
      `Order ${order.reference} placed`,
      "Order",
      order.id,
    );

    res.status(201).json({ order });
  },
);

export const listOrders = asyncHandler(async (req, res) => {
  const where = req.user!.role === "ADMIN" ? {} : { customerId: req.user!.id };

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      invoice: true,
      customer: { select: publicUserSelect },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      invoice: true,
      quote: true,
      customer: { select: publicUserSelect },
    },
  });
  if (!order) throw new AppError(404, "Order not found.");
  if (req.user!.role !== "ADMIN" && order.customerId !== req.user!.id) {
    throw new AppError(403, "You cannot view this order.");
  }
  res.json({ order });
});

export const updateOrderStatus = asyncHandler(
  async (req, res) => {
    const input = orderStatusSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: input.status },
      include: { invoice: true },
    });

    await notifyUser(
      order.customerId,
      "Order status updated",
      `${order.reference} is now ${input.status.toLowerCase()}.`,
      "/portal/orders",
    );
    await logActivity(
      req.user!.id,
      "order.status",
      `${order.reference} changed to ${input.status}`,
      "Order",
      order.id,
    );

    res.json({ order });
  },
);

// ---------------- Invoices ----------------

export const listInvoices = asyncHandler(
  async (req, res) => {
    const where = req.user!.role === "ADMIN" ? {} : { customerId: req.user!.id };
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: { select: { reference: true, status: true } },
        customer: { select: publicUserSelect },
      },
      orderBy: { issuedAt: "desc" },
    });
    res.json({ invoices });
  },
);

export const payInvoice = asyncHandler(
  async (req, res) => {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: "PAID", paidAt: new Date() },
    });
    res.json({ invoice });
  },
);
