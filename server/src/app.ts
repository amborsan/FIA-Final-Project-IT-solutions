import express from "express";
import path from "node:path";
import { existsSync } from "node:fs";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { prisma } from "./prisma.ts";
import { attachUser } from "./auth/session.ts";
import { csrfProtection } from "./middleware/csrf.ts";
import { apiLimiter } from "./middleware/rateLimits.ts";
import { AppError } from "./middleware/errors.ts";

import authRoutes from "./routes/auth.routes.ts";
import publicRoutes from "./routes/public.routes.ts";
import catalogRoutes from "./routes/catalog.routes.ts";
import contentRoutes from "./routes/content.routes.ts";
import requestRoutes from "./routes/requests.routes.ts";
import quoteRoutes from "./routes/quotes.routes.ts";
import orderRoutes from "./routes/orders.routes.ts";
import ticketRoutes from "./routes/tickets.routes.ts";
import appointmentRoutes from "./routes/appointments.routes.ts";
import reportRoutes from "./routes/reports.routes.ts";
import chatRoutes from "./routes/chat.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";
import profileRoutes from "./routes/profile.routes.ts";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security headers. The CSP allows the bundled SPA but no third-party scripts.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:", "blob:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, same-origin) are allowed.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Origin not allowed by CORS."));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// CSRF check + login state are needed by every /api route.
app.use("/api", csrfProtection);
app.use("/api", apiLimiter);
app.use("/api", attachUser);

app.get("/api", (_req, res) => {
  res.json({
    message: "Orbit IT Solutions API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api", catalogRoutes);
app.use("/api", contentRoutes);
app.use("/api", requestRoutes);
app.use("/api", quoteRoutes);
app.use("/api", orderRoutes);
app.use("/api", ticketRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", reportRoutes);
app.use("/api", chatRoutes);
app.use("/api", profileRoutes);
app.use("/api/admin", adminRoutes);

// In production the built React app can be served by Express.
const clientDist = path.resolve(process.env.CLIENT_DIST || "../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(clientDist, "index.html"));
    }
    next();
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Central error handler. It never sends stack traces to the browser.
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Please check the form fields.",
        details: error.flatten(),
      });
    }

    if (error instanceof AppError) {
      return res
        .status(error.status)
        .json({ error: error.message, details: error.details });
    }

    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      return res.status(409).json({ error: "This value already exists." });
    }
    if (code === "P2025") {
      return res.status(404).json({ error: "Record not found." });
    }
    if (code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "The file is larger than 8 MB." });
    }

    if (process.env.NODE_ENV !== "test") {
      console.error(error);
    }
    res.status(500).json({ error: "Something went wrong. Please try again." });
  },
);

// Make the database available to tests without importing it separately.
app.locals.prisma = prisma;

export default app;
