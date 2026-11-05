import type { NextFunction, Request, Response } from "express";
import {
  CSRF_COOKIE,
  createCsrfToken,
  setCsrfCookie,
  safeEqual,
} from "../auth/session.ts";

/**
 * CSRF protection.
 * The server puts a random token in a readable cookie. JavaScript must send the
 * same token in the X-CSRF-Token header for POST/PUT/PATCH/DELETE requests.
 * An attacker on another site cannot read the cookie, so the request fails.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  let cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;

  // Make sure a token exists before the first form is submitted.
  if (!cookieToken) {
    cookieToken = createCsrfToken();
    setCsrfCookie(res, cookieToken);
  }
  res.locals.csrfToken = cookieToken;

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const headerToken = req.get("x-csrf-token");
  if (!headerToken || !safeEqual(headerToken, cookieToken)) {
    return res.status(403).json({ error: "Invalid or missing CSRF token." });
  }

  next();
}
