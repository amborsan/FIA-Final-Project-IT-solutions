import type { UserRole } from "../generated/prisma/enums.ts";

// The parts of a user that are safe to send to the browser.
export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  phone: string | null;
  companyName: string | null;
  address: string | null;
  preferredLanguage: "EN" | "DE";
  createdAt: Date;
};

// Express Request objects get these extra fields after login checks.
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      sessionId?: string;
    }
  }
}

export {};
