import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { AppError } from "./errors.ts";

// Uploaded reports are stored with a random name. Only the owner/staff can download.
export const uploadDir = path.resolve("storage/reports");
mkdirSync(uploadDir, { recursive: true });

export const reportUpload = multer({
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
