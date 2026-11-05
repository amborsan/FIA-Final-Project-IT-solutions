import { Router } from "express";
import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { authLimiter } from "../middleware/rateLimits.ts";
import { hashPassword, verifyPassword } from "../auth/password.ts";
import {
  createSession,
  destroySession,
  publicUserSelect,
} from "../auth/session.ts";
import { loginSchema, registerSchema } from "../validation/schemas.ts";
import { logActivity } from "../utils/activity.ts";

const router = Router();

// The client calls this once on start-up to receive the CSRF cookie/value.
router.get("/csrf", (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "An account with this email already exists.");
    }

    const now = new Date();
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        fullName: `${input.firstName} ${input.lastName}`.trim(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        companyName: input.companyName || null,
        preferredLanguage: input.preferredLanguage,
        acceptedTermsAt: now,
        acceptedPrivacyAt: now,
      },
      select: publicUserSelect,
    });

    await createSession(user.id, req, res);
    await logActivity(user.id, "account.register", "Account created", "User", user.id);

    res.status(201).json({ user });
  }),
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);

    const account = await prisma.user.findUnique({ where: { email: input.email } });
    // Use one generic message so attackers cannot find out which emails exist.
    if (
      !account ||
      account.deletedAt ||
      !(await verifyPassword(account.passwordHash, input.password))
    ) {
      throw new AppError(401, "Email or password is incorrect.");
    }

    await createSession(account.id, req, res);
    await logActivity(account.id, "account.login", "Signed in", "User", account.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: account.id },
      select: publicUserSelect,
    });
    res.json({ user });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await destroySession(req, res);
    res.json({ message: "Signed out." });
  }),
);

// Returns the current user, or null for visitors. The client uses this on load.
router.get("/me", (req, res) => {
  res.json({ user: req.user ?? null });
});

export default router;
