import { prisma } from "../prisma.ts";

// Activity entries power the "recent activity" lists in profiles and dashboards.
export async function logActivity(
  userId: string | null,
  action: string,
  description: string,
  entityType?: string,
  entityId?: string,
) {
  await prisma.activityLog.create({
    data: { userId, action, description, entityType, entityId },
  });
}

// In-app notifications are intentionally simple. Email is out of scope for the MVP.
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  link?: string,
) {
  await prisma.notification.create({
    data: { userId, title, message, link },
  });
}
