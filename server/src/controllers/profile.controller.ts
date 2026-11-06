import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { publicUserSelect } from "../auth/session.ts";
import {
  changePasswordSchema,
  profileSchema,
} from "../validation/schemas.ts";
import { hashPassword, verifyPassword } from "../auth/password.ts";
import { logActivity } from "../utils/activity.ts";

export const getProfile = asyncHandler(async (req, res) => {
  const [user, requests, tickets, orders, unread] = await Promise.all([
    prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        ...publicUserSelect,
        acceptedTermsAt: true,
        acceptedPrivacyAt: true,
      },
    }),
    prisma.serviceRequest.count({ where: { customerId: req.user!.id } }),
    prisma.ticket.count({ where: { customerId: req.user!.id } }),
    prisma.order.count({ where: { customerId: req.user!.id } }),
    prisma.notification.count({
      where: { userId: req.user!.id, readAt: null },
    }),
  ]);

  res.json({
    user,
    counts: { requests, tickets, orders, unreadNotifications: unread },
  });
});

export const updateProfile = asyncHandler(
  async (req, res) => {
    const input = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        fullName: input.fullName,
        phone: input.phone || null,
        companyName: input.companyName || null,
        address: input.address || null,
        preferredLanguage: input.preferredLanguage,
      },
      select: publicUserSelect,
    });
    res.json({ user });
  },
);

export const changePassword = asyncHandler(
  async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    const account = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    if (!(await verifyPassword(account.passwordHash, input.currentPassword))) {
      throw new AppError(400, "The current password is incorrect.");
    }

    await prisma.user.update({
      where: { id: account.id },
      data: { passwordHash: await hashPassword(input.newPassword) },
    });

    // Sign out all other devices, but keep the current session alive.
    await prisma.session.deleteMany({
      where: { userId: account.id, id: { not: req.sessionId } },
    });
    await logActivity(
      account.id,
      "account.password",
      "Password changed",
      "User",
      account.id,
    );

    res.json({ message: "Password updated." });
  },
);

// ---------------- Notifications ----------------

export const listNotifications = asyncHandler(
  async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ notifications });
  },
);

export const markAllNotificationsRead = asyncHandler(
  async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ message: "All notifications marked as read." });
  },
);

export const markNotificationRead = asyncHandler(
  async (req, res) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { readAt: new Date() },
    });
    res.json({ message: "Notification marked as read." });
  },
);

export const listMyActivity = asyncHandler(
  async (req, res) => {
    const activity = await prisma.activityLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ activity });
  },
);

// ---------------- GDPR tools ----------------

// Download all personal data as a JSON file (right of access / portability).
export const exportPersonalData = asyncHandler(
  async (req, res) => {
    const userId = req.user!.id;
    const [
      user,
      requests,
      quotes,
      orders,
      invoices,
      tickets,
      appointments,
      reports,
      conversations,
      notifications,
      sentMessages,
      activity,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...publicUserSelect,
          acceptedTermsAt: true,
          acceptedPrivacyAt: true,
          updatedAt: true,
        },
      }),
      prisma.serviceRequest.findMany({ where: { customerId: userId } }),
      prisma.quote.findMany({
        where: { customerId: userId },
        include: { items: true },
      }),
      prisma.order.findMany({
        where: { customerId: userId },
        include: { items: true },
      }),
      prisma.invoice.findMany({ where: { customerId: userId } }),
      prisma.ticket.findMany({
        where: { OR: [{ customerId: userId }, { assignedTechnicianId: userId }] },
        include: { messages: true },
      }),
      prisma.appointment.findMany({ where: { customerId: userId } }),
      prisma.serviceReport.findMany({
        where: {
          OR: [
            { technicianId: userId },
            { request: { customerId: userId } },
            { ticket: { customerId: userId } },
          ],
        },
      }),
      prisma.conversation.findMany({
        where: { customerId: userId },
        include: { messages: true },
      }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.message.findMany({ where: { senderId: userId } }),
      prisma.activityLog.findMany({ where: { userId } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: user,
      serviceRequests: requests,
      quotes,
      orders,
      invoices,
      tickets,
      appointments,
      serviceReports: reports,
      conversations,
      notifications,
      sentMessages,
      activity,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orbit-data-${userId.slice(0, 8)}.json"`,
    );
    res.send(JSON.stringify(exportData, null, 2));
  },
);

// Delete the account and anonymise personal details. Orders/invoices are kept
// because German tax law requires businesses to retain them for 10 years.
export const deleteAccount = asyncHandler(
  async (req, res) => {
    if (req.user!.role === "ADMIN") {
      throw new AppError(
        400,
        "Admin accounts must be removed by another admin in the team area.",
      );
    }
    const password = String(req.body.password || "");
    const account = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    if (!(await verifyPassword(account.passwordHash, password))) {
      throw new AppError(400, "Password is incorrect.");
    }

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: account.id } }),
      prisma.notification.deleteMany({ where: { userId: account.id } }),
      prisma.conversationParticipant.deleteMany({ where: { userId: account.id } }),
      prisma.message.updateMany({
        where: { senderId: account.id },
        data: { senderId: null, senderName: "Deleted account" },
      }),
      prisma.ticketMessage.updateMany({
        where: { authorId: account.id },
        data: { authorId: null, authorName: "Deleted account" },
      }),
      prisma.activityLog.deleteMany({ where: { userId: account.id } }),
      prisma.user.update({
        where: { id: account.id },
        data: {
          email: `deleted-${account.id}@example.invalid`,
          fullName: "Deleted account",
          firstName: null,
          lastName: null,
          phone: null,
          companyName: null,
          address: null,
          passwordHash: await hashPassword(crypto.randomUUID()),
          deletedAt: new Date(),
        },
      }),
      prisma.conversation.updateMany({
        where: { customerId: account.id },
        data: { guestName: "Deleted account", guestEmail: null },
      }),
    ]);

    res.clearCookie("orbit_session");
    res.json({
      message:
        "Your account was deleted and personal data was anonymised. Invoice records are kept as required by law.",
    });
  },
);
