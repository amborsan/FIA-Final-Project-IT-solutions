import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import {
  appointmentSchema,
  appointmentStatusSchema,
} from "../validation/schemas.ts";
import { notifyUser } from "../utils/activity.ts";
import { publicUserSelect } from "../auth/session.ts";

export const listAppointments = asyncHandler(
  async (req, res) => {
    const where =
      req.user!.role === "ADMIN"
        ? {}
        : req.user!.role === "TECHNICIAN"
          ? { technicianId: req.user!.id }
          : { customerId: req.user!.id };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: { select: publicUserSelect },
        technician: { select: publicUserSelect },
        request: { select: { id: true, reference: true, title: true } },
      },
      orderBy: { startsAt: "asc" },
    });
    res.json({ appointments });
  },
);

export const createAppointment = asyncHandler(
  async (req, res) => {
    const input = appointmentSchema.parse(req.body);
    if (input.endsAt <= input.startsAt) {
      throw new AppError(400, "The end time must be after the start time.");
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: input.customerId,
        technicianId: input.technicianId || null,
        requestId: input.requestId || null,
        title: input.title,
        notes: input.notes || null,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        location: input.location || null,
      },
      include: { customer: { select: publicUserSelect } },
    });

    await notifyUser(
      appointment.customerId,
      "Appointment scheduled",
      `${appointment.title} on ${appointment.startsAt.toLocaleDateString("en-GB")}`,
      "/portal/appointments",
    );
    if (appointment.technicianId) {
      await notifyUser(
        appointment.technicianId,
        "New appointment",
        `${appointment.title} on ${appointment.startsAt.toLocaleDateString("en-GB")}`,
        "/technician",
      );
    }

    res.status(201).json({ appointment });
  },
);

export const updateAppointmentStatus = asyncHandler(
  async (req, res) => {
    const input = appointmentStatusSchema.parse(req.body);
    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new AppError(404, "Appointment not found.");

    const isCustomer = existing.customerId === req.user!.id;
    const isStaff =
      req.user!.role === "ADMIN" || existing.technicianId === req.user!.id;
    if (!isCustomer && !isStaff) {
      throw new AppError(403, "You cannot change this appointment.");
    }
    if (isCustomer && !["CONFIRMED", "CANCELLED"].includes(input.status)) {
      throw new AppError(403, "Customers can only confirm or cancel.");
    }

    const appointment = await prisma.appointment.update({
      where: { id: existing.id },
      data: { status: input.status },
    });
    res.json({ appointment });
  },
);
