import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { prisma } from "../prisma.ts";
import type { PublicUser } from "../types/express.d.ts";

export const SESSION_COOKIE = "orbit_session";
export const CSRF_COOKIE = "orbit_csrf";
const SESSION_DAYS = 7;

// Only the hash of a session token is stored in the database.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Fields that are safe to return to the browser.
export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  companyName: true,
  address: true,
  preferredLanguage: true,
  createdAt: true,
} as const;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function createCsrfToken(): string {
  return randomBytes(24).toString("hex");
}

export function setCsrfCookie(res: Response, token: string) {
  // The CSRF cookie is readable by JavaScript on purpose (double-submit pattern).
  res.cookie(CSRF_COOKIE, token, { ...cookieOptions, httpOnly: false });
}

export async function createSession(
  userId: string,
  req: Request,
  res: Response,
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: req.get("user-agent")?.slice(0, 255),
      ip: req.ip,
    },
  });

  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions,
    expires: expiresAt,
  });
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

// Load the logged-in user for every request. The routes decide if login is required.
export async function attachUser(req: Request, _res: Response, next: () => void) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return next();

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { ...publicUserSelect, deletedAt: true } } },
  });

  if (
    !session ||
    session.expiresAt < new Date() ||
    session.user.deletedAt
  ) {
    return next();
  }

  const { deletedAt: _deletedAt, ...user } = session.user;
  req.user = user as PublicUser;
  req.sessionId = session.id;
  next();
}

/** Compare two strings without leaking timing information. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
