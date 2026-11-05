import { Router } from "express";
import { prisma } from "../prisma.ts";
import { asyncHandler } from "../middleware/errors.ts";
import { formLimiter } from "../middleware/rateLimits.ts";
import { contactSchema } from "../validation/schemas.ts";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Orbit IT Solutions API" });
});

router.post(
  "/contact",
  formLimiter,
  asyncHandler(async (req, res) => {
    const input = contactSchema.parse(req.body);

    const message = await prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        subject: input.subject,
        message: input.message,
        consentAt: new Date(),
      },
    });

    // Let every admin know that a new enquiry arrived.
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", deletedAt: null },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New contact message",
          message: `${input.name}: ${input.subject}`,
          link: "/admin/inbox",
        })),
      });
    }

    res.status(201).json({
      message: "Thank you. We will get back to you shortly.",
      id: message.id,
    });
  }),
);

export default router;
