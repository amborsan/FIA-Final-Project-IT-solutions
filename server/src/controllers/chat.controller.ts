import { randomBytes } from "node:crypto";
import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import {
  chatStartSchema,
  guestChatSchema,
  guestMessageSchema,
  messageSchema,
} from "../validation/schemas.ts";
import { notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

type ConversationRow = {
  id: string;
  customerId: string | null;
  status: string;
};

// Admins can open every conversation. Other users need to be a participant,
// the customer who owns the conversation, or the guest with the secret token.
function hasAccess(
  conversation: ConversationRow,
  userId: string,
  role: string,
  participantIds: string[],
) {
  return (
    role === "ADMIN" ||
    conversation.customerId === userId ||
    participantIds.includes(userId)
  );
}

async function getStaffIds() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  return admins.map((admin) => admin.id);
}

// ---------------- Guest chat (no account needed) ----------------

export const startGuestChat = asyncHandler(
  async (req, res) => {
    const input = guestChatSchema.parse(req.body);
    const token = randomBytes(24).toString("hex");

    const conversation = await prisma.conversation.create({
      data: {
        subject: input.subject,
        type: "GUEST",
        guestName: input.name,
        guestEmail: input.email,
        guestToken: token,
        consentAt: new Date(),
        messages: {
          create: { senderName: input.name, body: input.message },
        },
      },
    });

    const staffIds = await getStaffIds();
    if (staffIds.length > 0) {
      await prisma.notification.createMany({
        data: staffIds.map((id) => ({
          userId: id,
          title: "New guest chat",
          message: `${input.name}: ${input.subject}`,
          link: "/admin/messages",
        })),
      });
    }

    res.status(201).json({
      conversationId: conversation.id,
      token,
      message: "Your message was sent. We usually reply within one business day.",
    });
  },
);

export const getGuestChat = asyncHandler(
  async (req, res) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (
      !conversation ||
      !conversation.guestToken ||
      conversation.guestToken !== String(req.query.token || "")
    ) {
      throw new AppError(404, "Conversation not found.");
    }
    res.json({
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        createdAt: conversation.createdAt,
        messages: conversation.messages,
      },
    });
  },
);

export const postGuestMessage = asyncHandler(
  async (req, res) => {
    const input = guestMessageSchema.parse(req.body);
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });
    if (
      !conversation ||
      !conversation.guestToken ||
      conversation.guestToken !== input.token
    ) {
      throw new AppError(404, "Conversation not found.");
    }
    if (conversation.status === "CLOSED") {
      throw new AppError(400, "This conversation is closed.");
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderName: conversation.guestName,
        body: input.body,
      },
    });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    res.status(201).json({ message });
  },
);

// ---------------- Authenticated chat ----------------

export const listConversations = asyncHandler(
  async (req, res) => {
    const conversations = await prisma.conversation.findMany({
      where:
        req.user!.role === "ADMIN"
          ? {}
          : {
              OR: [
                { customerId: req.user!.id },
                { participants: { some: { userId: req.user!.id } } },
              ],
            },
      include: {
        customer: { select: publicUserSelect },
        participants: { include: { user: { select: publicUserSelect } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ conversations });
  },
);

export const createConversation = asyncHandler(
  async (req, res) => {
    const input = chatStartSchema.parse(req.body);
    const staffIds = await getStaffIds();

    // Customers can only open support conversations. Staff can chat directly.
    if (req.user!.role === "CUSTOMER" && input.type === "DIRECT") {
      throw new AppError(403, "Customers can only open support chats.");
    }

    const participantIds = new Set<string>();
    if (req.user!.role === "CUSTOMER") {
      participantIds.add(req.user!.id);
    } else {
      participantIds.add(req.user!.id);
      for (const id of input.participantIds ?? []) participantIds.add(id);
    }

    const conversation = await prisma.conversation.create({
      data: {
        subject: input.subject,
        type: req.user!.role === "CUSTOMER" ? "SUPPORT" : input.type,
        customerId: req.user!.role === "CUSTOMER" ? req.user!.id : null,
        createdById: req.user!.id,
        participants: {
          create: Array.from(participantIds).map((userId) => ({ userId })),
        },
        messages: {
          create: { senderId: req.user!.id, body: input.message },
        },
      },
      include: { participants: true, messages: true },
    });

    // Notify the other participants and, for customer chats, the admin team.
    for (const id of participantIds) {
      if (id !== req.user!.id) {
        await notifyUser(
          id,
          "New chat message",
          `${req.user!.fullName}: ${input.subject}`,
          "/messages",
        );
      }
    }
    if (req.user!.role === "CUSTOMER") {
      for (const id of staffIds) {
        await notifyUser(
          id,
          "New support chat",
          `${req.user!.fullName}: ${input.subject}`,
          "/admin/messages",
        );
      }
    }

    res.status(201).json({ conversation });
  },
);

export const getConversation = asyncHandler(
  async (req, res) => {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: publicUserSelect },
        participants: { include: { user: { select: publicUserSelect } } },
        messages: {
          include: { sender: { select: publicUserSelect } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!conversation) throw new AppError(404, "Conversation not found.");

    const participantIds = conversation.participants.map((p) => p.userId);
    if (!hasAccess(conversation, req.user!.id, req.user!.role, participantIds)) {
      throw new AppError(403, "You cannot view this conversation.");
    }

    res.json({ conversation });
  },
);

export const postConversationMessage = asyncHandler(
  async (req, res) => {
    const input = messageSchema.parse(req.body);
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { participants: true },
    });
    if (!conversation) throw new AppError(404, "Conversation not found.");
    if (conversation.status === "CLOSED") {
      throw new AppError(400, "This conversation is closed.");
    }

    const participantIds = conversation.participants.map((p) => p.userId);
    if (!hasAccess(conversation, req.user!.id, req.user!.role, participantIds)) {
      throw new AppError(403, "You cannot reply to this conversation.");
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user!.id,
        body: input.body,
      },
      include: { sender: { select: publicUserSelect } },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Notify everyone involved except the sender.
    const recipients = new Set<string>(participantIds);
    if (conversation.customerId) recipients.add(conversation.customerId);
    if (conversation.customerId) {
      for (const id of await getStaffIds()) recipients.add(id);
    }
    for (const id of recipients) {
      if (id !== req.user!.id) {
        await notifyUser(
          id,
          "New chat message",
          `${req.user!.fullName}: ${input.body.slice(0, 80)}`,
          conversation.customerId ? "/messages" : "/messages",
        );
      }
    }

    res.status(201).json({ message });
  },
);

export const closeConversation = asyncHandler(
  async (req, res) => {
    const conversation = await prisma.conversation.update({
      where: { id: req.params.id },
      data: { status: "CLOSED" },
    });
    res.json({ conversation });
  },
);
