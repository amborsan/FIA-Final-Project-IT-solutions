import { z } from "zod";

// All incoming JSON is checked here before it reaches the database.

const email = z.email("Please enter a valid email address.").max(180).toLowerCase();
const password = z
  .string()
  .min(10, "The password must be at least 10 characters long.")
  .max(100)
  .regex(/[A-Za-z]/, "The password must contain a letter.")
  .regex(/[0-9]/, "The password must contain a number.");

const phone = z.string().trim().max(40).optional().or(z.literal(""));
const optionalText = (max = 500) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email,
  password,
  phone,
  companyName: optionalText(160),
  preferredLanguage: z.enum(["EN", "DE"]).default("EN"),
  acceptTerms: z.literal(true, { message: "You must accept the terms." }),
  acceptPrivacy: z.literal(true, { message: "You must accept the privacy policy." }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(100),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone,
  companyName: optionalText(160),
  address: optionalText(300),
  preferredLanguage: z.enum(["EN", "DE"]),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

export const publicRequestSchema = z.object({
  contactName: z.string().trim().min(2).max(120),
  contactEmail: email,
  contactPhone: phone,
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(4000),
  serviceId: z.uuid().optional().or(z.literal("")),
  siteAddress: optionalText(300),
  preferredDate: z.coerce.date().optional(),
  budget: z.coerce.number().min(0).max(1000000).optional(),
  acceptPrivacy: z.literal(true, { message: "Please accept the privacy policy." }),
});

export const staffRequestSchema = z.object({
  customerId: z.uuid().optional().or(z.literal("")),
  serviceId: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4000),
  siteAddress: optionalText(300),
  preferredDate: z.coerce.date().optional(),
  budget: z.coerce.number().min(0).max(1000000).optional(),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: email,
  contactPhone: phone,
});

export const requestStatusSchema = z.object({
  status: z.enum([
    "NEW", "REVIEWING", "QUOTED", "APPROVED", "SCHEDULED",
    "IN_PROGRESS", "COMPLETED", "CANCELLED",
  ]),
});

export const assignSchema = z.object({
  technicianId: z.uuid().nullable().optional(),
  customerId: z.uuid().nullable().optional(),
});

export const quoteItemSchema = z.object({
  productId: z.uuid().optional().or(z.literal("")),
  description: z.string().trim().min(2).max(300),
  quantity: z.coerce.number().int().min(1).max(999),
  unitPrice: z.coerce.number().min(0).max(1000000),
});

export const quoteSchema = z.object({
  requestId: z.uuid(),
  validUntil: z.coerce.date(),
  notes: optionalText(2000),
  taxRate: z.coerce.number().min(0).max(100).default(19),
  items: z.array(quoteItemSchema).min(1, "Add at least one item."),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty."),
  shippingAddress: z.string().trim().min(10).max(300),
  notes: optionalText(1000),
  acceptTerms: z.literal(true, { message: "You must accept the terms." }),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"]),
});

export const ticketSchema = z.object({
  subject: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(4000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  category: optionalText(80),
  requestId: z.uuid().optional().or(z.literal("")),
});

export const ticketMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  isInternal: z.boolean().optional(),
});

export const ticketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]),
});

export const appointmentSchema = z.object({
  customerId: z.uuid(),
  technicianId: z.uuid().optional().or(z.literal("")),
  requestId: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3).max(160),
  notes: optionalText(1000),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  location: optionalText(300),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export const reportSchema = z.object({
  requestId: z.uuid().optional().or(z.literal("")),
  ticketId: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3).max(160),
  workDone: z.string().trim().min(10).max(8000),
  hours: z.coerce.number().min(0.25).max(500),
  materials: optionalText(2000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  phone,
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  acceptPrivacy: z.literal(true, { message: "Please accept the privacy policy." }),
});

export const chatStartSchema = z.object({
  type: z.enum(["SUPPORT", "DIRECT"]).default("SUPPORT"),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(1).max(4000),
  participantIds: z.array(z.uuid()).max(20).optional(),
});

export const guestChatSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(1).max(4000),
  acceptPrivacy: z.literal(true, { message: "Please accept the privacy policy." }),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const guestMessageSchema = z.object({
  token: z.string().min(20).max(100),
  body: z.string().trim().min(1).max(4000),
});

export const contentSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only."),
  titleEn: z.string().trim().min(3).max(160),
  titleDe: z.string().trim().min(3).max(160),
  excerptEn: optionalText(300),
  excerptDe: optionalText(300),
  bodyEn: z.string().min(1).max(100000),
  bodyDe: z.string().min(1).max(100000),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const serviceSchema = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().trim().min(2).max(160),
  nameDe: z.string().trim().min(2).max(160),
  descriptionEn: z.string().trim().min(10).max(4000),
  descriptionDe: z.string().trim().min(10).max(4000),
  icon: z.string().trim().max(50).default("network"),
  startingPrice: z.coerce.number().min(0).optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const productSchema = z.object({
  slug: z.string().trim().min(3).max(120).regex(/^[a-z0-9-]+$/),
  sku: z.string().trim().min(2).max(60),
  categoryId: z.uuid(),
  nameEn: z.string().trim().min(2).max(160),
  nameDe: z.string().trim().min(2).max(160),
  descriptionEn: z.string().trim().min(10).max(4000),
  descriptionDe: z.string().trim().min(10).max(4000),
  price: z.coerce.number().min(0).max(1000000),
  stock: z.coerce.number().int().min(0).max(100000),
  imageUrl: optionalText(500),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const adminUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email,
  password,
  role: z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]),
  phone,
  companyName: optionalText(160),
  address: optionalText(300),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]).optional(),
  phone,
  companyName: optionalText(160),
  address: optionalText(300),
  active: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
