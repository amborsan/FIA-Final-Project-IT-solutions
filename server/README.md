# Orbit IT Solutions — Backend API

Express 5 + Prisma 7 + PostgreSQL + TypeScript.

## Quick start

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

The API runs on `http://localhost:3000`.

## Folder guide

```text
src/
├── app.ts                 Express app, middleware, route mounting
├── main.ts                Startup and graceful shutdown
├── prisma.ts              Shared PrismaClient with PostgreSQL adapter
├── auth/
│   ├── password.ts        Argon2 hash/verify
│   └── session.ts         Session cookies, user loading, CSRF helpers
├── middleware/
│   ├── auth.ts            requireAuth / requireRole
│   ├── csrf.ts            Double-submit CSRF check
│   ├── errors.ts          AppError + async wrapper
│   └── rateLimits.ts      Login and form rate limits
├── routes/                One file per feature area
├── utils/                 References, totals, sanitising, activity/notifications
├── validation/schemas.ts  All Zod input schemas
└── generated/prisma/      Generated Prisma Client (do not edit)
```

## Authentication flow

1. The browser calls `GET /api/auth/csrf`. The server sets an `orbit_csrf`
   cookie (readable by JS) and returns the same token in the JSON body.
2. `POST /api/auth/login` sends email + password with `X-CSRF-Token`.
3. The server verifies the Argon2 hash and creates a `Session` row. The raw
   session token goes into the HTTP-only `orbit_session` cookie; only its
   SHA-256 hash is stored in the database.
4. Every `/api` request runs `attachUser`, which loads the session and user.
5. Logout deletes the session row and clears both cookies.

## Roles

| Role | Access |
| --- | --- |
| `CUSTOMER` | Own requests, quotes, orders, invoices, tickets, appointments, reports, chats, profile |
| `TECHNICIAN` | Assigned requests/tickets/appointments, service reports, staff chat |
| `ADMIN` | Everything, including users, catalog, CMS, quotes, orders, contact inbox, activity |

Server-side checks are the source of truth. UI hiding is only a convenience.

## Database

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations`
- Seed: `prisma/seed.ts` (idempotent for catalog/users; sample transactions only on an empty DB)

Useful commands:

```bash
npm run db:migrate   # development migration
npm run db:deploy    # production migration
npm run db:seed
npm run db:studio
npm run db:validate
```

## Tests

```bash
npm test             # unit + API tests
npm run build        # type check
```

The API tests start the Express app on an ephemeral port and use the
development database. They only create short-lived sessions.

## Uploaded files

Service report attachments are stored in `storage/reports` with random file
names. They are **not** publicly served. `GET /api/reports/:id/file` checks the
role/ownership before sending the file. Allowed: PDF, PNG, JPG, max 8 MB.

## Production checklist

- Set `NODE_ENV=production`.
- Use a strong `DATABASE_URL` password and restrict network access.
- Run behind HTTPS; session cookies become `Secure`.
- Set `CLIENT_ORIGIN` to the real domain(s).
- Build the client (`cd ../client && npm run build`) so Express serves it.
- Set up database backups and log rotation.
- Replace demo users, services, products and legal placeholders.
- Keep dependencies updated (`npm audit`).

## API documentation

See [../docs/api.md](../docs/api.md).
