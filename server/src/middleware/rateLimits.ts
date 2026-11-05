import rateLimit from "express-rate-limit";

// Basic protection against brute-force and spam. In tests the limits are skipped.
const skip = () => process.env.NODE_ENV === "test";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: { error: "Too many requests. Please wait a moment." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

export const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  message: { error: "Too many messages. Please try again later." },
});
