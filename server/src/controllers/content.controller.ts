import { prisma } from "../prisma.ts";
import { AppError, asyncHandler } from "../middleware/errors.ts";
import { contentSchema } from "../validation/schemas.ts";
import { makeExcerpt, sanitizeRichText } from "../utils/sanitize.ts";

// Published articles are public. Drafts are only visible to admins.
export const listContent = asyncHandler(
  async (req, res) => {
    const isAdmin = req.user?.role === "ADMIN";
    const pages = await prisma.contentPage.findMany({
      where: isAdmin && req.query.all === "true" ? {} : { status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleDe: true,
        excerptEn: true,
        excerptDe: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { fullName: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ pages });
  },
);

export const getContent = asyncHandler(
  async (req, res) => {
    const page = await prisma.contentPage.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { fullName: true } } },
    });
    if (!page || (page.status !== "PUBLISHED" && req.user?.role !== "ADMIN")) {
      throw new AppError(404, "Page not found.");
    }
    res.json({ page });
  },
);

// ---------------- Admin CMS ----------------

export const adminListContent = asyncHandler(
  async (_req, res) => {
    const pages = await prisma.contentPage.findMany({
      orderBy: { updatedAt: "desc" },
    });
    res.json({ pages });
  },
);

export const adminCreateContent = asyncHandler(
  async (req, res) => {
    const input = contentSchema.parse(req.body);
    const bodyEn = sanitizeRichText(input.bodyEn);
    const bodyDe = sanitizeRichText(input.bodyDe);

    const page = await prisma.contentPage.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleDe: input.titleDe,
        excerptEn: input.excerptEn || makeExcerpt(bodyEn),
        excerptDe: input.excerptDe || makeExcerpt(bodyDe),
        bodyEn,
        bodyDe,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        authorId: req.user!.id,
      },
    });
    res.status(201).json({ page });
  },
);

export const adminUpdateContent = asyncHandler(
  async (req, res) => {
    const input = contentSchema.partial().parse(req.body);
    const existing = await prisma.contentPage.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new AppError(404, "Page not found.");

    const page = await prisma.contentPage.update({
      where: { id: req.params.id },
      data: {
        ...input,
        bodyEn: input.bodyEn ? sanitizeRichText(input.bodyEn) : undefined,
        bodyDe: input.bodyDe ? sanitizeRichText(input.bodyDe) : undefined,
        publishedAt:
          input.status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : undefined,
      },
    });
    res.json({ page });
  },
);

export const adminDeleteContent = asyncHandler(
  async (req, res) => {
    await prisma.contentPage.delete({ where: { id: req.params.id } });
    res.json({ message: "Page deleted." });
  },
);
