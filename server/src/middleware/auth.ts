import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors.ts";

/** Allow only logged-in users. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, "You must be logged in to do that."));
  }
  next();
}

/** Allow only the listed roles, e.g. requireRole("ADMIN", "TECHNICIAN"). */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "You must be logged in to do that."));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to do that."));
    }
    next();
  };
}
