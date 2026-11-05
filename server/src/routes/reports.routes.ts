import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import { reportSchema } from "../validation/schemas.ts";
import { notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

const router = Router();

// Uploaded reports are stored with a random name. Only the owner/staff can download.
const uploadDir = path.resolve("storage/reports");
mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError(400, "Only PDF, PNG or JPG files are allowed."));
    }
    cb(null, true);
  },
});

router.get(
  "/reports",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where =
      req.user!.role === "ADMIN"
        ? {}
        : req.user!.role === "TECHNICIAN"
          ? { technicianId: req.user!.id }
          : {
              OR: [
                { request: { customerId: req.user!.id } },
                { ticket: { customerId: req.user!.id } },
              ],
            };

    const reports = await prisma.serviceReport.findMany({
      where,
      include: {
        technician: { select: publicUserSelect },
        request: { select: { id: true, reference: true, title: true } },
        ticket: { select: { id: true, reference: true, subject: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ reports });
  }),
);

router.post(
  "/reports",
  requireRole("TECHNICIAN", "ADMIN"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;

    try {
      const input = reportSchema.parse(req.body);
      if (!input.requestId && !input.ticketId) {
        throw new AppError(400, "Choose a request or a ticket.");
      }

      // Technicians may only write reports for work assigned to them.
      if (input.requestId) {
        const request = await prisma.serviceRequest.findUnique({
          where: { id: input.requestId },
        });
        if (!request) throw new AppError(404, "Request not found.");
        if (
          req.user!.role === "TECHNICIAN" &&
          request.assignedTechnicianId !== req.user!.id
        ) {
          throw new AppError(403, "This request is not assigned to you.");
        }
      }
      if (input.ticketId) {
        const ticket = await prisma.ticket.findUnique({
          where: { id: input.ticketId },
        });
        if (!ticket) throw new AppError(404, "Ticket not found.");
        if (
          req.user!.role === "TECHNICIAN" &&
          ticket.assignedTechnicianId !== req.user!.id
        ) {
          throw new AppError(403, "This ticket is not assigned to you.");
        }
      }

      const report = await prisma.serviceReport.create({
        data: {
          requestId: input.requestId || null,
          ticketId: input.ticketId || null,
          technicianId: req.user!.id,
          title: input.title,
          workDone: input.workDone,
          hours: input.hours,
          materials: input.materials || null,
          fileUrl: file?.filename ?? null,
          fileOriginalName: file?.originalname ?? null,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      const customerId = input.requestId
        ? (
            await prisma.serviceRequest.findUnique({
              where: { id: input.requestId },
              select: { customerId: true },
            })
          )?.customerId
        : (
            await prisma.ticket.findUnique({
              where: { id: input.ticketId },
              select: { customerId: true },
            })
          )?.customerId;
      if (customerId) {
        await notifyUser(
          customerId,
          "Service report available",
          report.title,
          "/portal/reports",
        );
      }

      res.status(201).json({ report });
    } catch (error) {
      // Do not leave an orphan file behind if the form was invalid.
      if (file) {
        try {
          unlinkSync(file.path);
        } catch {
          // Ignore cleanup errors.
        }
      }
      throw error;
    }
  }),
);

router.patch(
  "/reports/:id/approve",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const report = await prisma.serviceReport.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    });
    res.json({ report });
  }),
);

// Download is checked: staff or the customer who owns the request/ticket.
router.get(
  "/reports/:id/file",
  requireAuth,
  asyncHandler(async (req, res) => {
    const report = await prisma.serviceReport.findUnique({
      where: { id: req.params.id },
      include: {
        request: { select: { customerId: true } },
        ticket: { select: { customerId: true } },
      },
    });
    if (!report || !report.fileUrl) {
      throw new AppError(404, "File not found.");
    }

    const ownerId = report.request?.customerId ?? report.ticket?.customerId;
    const allowed =
      req.user!.role === "ADMIN" ||
      report.technicianId === req.user!.id ||
      ownerId === req.user!.id;
    if (!allowed) throw new AppError(403, "You cannot download this file.");

    res.download(
      path.join(uploadDir, report.fileUrl),
      report.fileOriginalName ?? "service-report",
    );
  }),
);

export default router;
