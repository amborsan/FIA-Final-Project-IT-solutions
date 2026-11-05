# AGENTS.md — Backend workspace

**You are working in `server/`. This is the backend only.**

## Absolutely do not

- Edit, create or delete anything inside `client/`. UI work belongs to the
  frontend developers.
- Edit generated Prisma files in `src/generated/prisma/**`.
- Change the public API response shape without updating `docs/api.md`,
  `client/src/lib/types.ts` and `docs/handoffs/backend-to-frontend.md`.
- Commit `.env`, database dumps, uploaded files or secrets.
- Disable CSRF, role checks, rate limits, validation or sanitising for demos.
- Return `passwordHash` or session tokens in API responses.

## Backend conventions

- Express 5, TypeScript, Prisma 7, PostgreSQL.
- One route module per feature in `src/routes/`.
- Validate every body/params with Zod in `src/validation/schemas.ts`.
- Use `AppError` + `asyncHandler` for errors; the central handler maps Zod and
  Prisma errors.
- Use `requireAuth` / `requireRole` for access control.
- Use `publicUserSelect` when returning users.
- Write an `ActivityLog` entry and a `Notification` for important user actions.
- Keep comments short and explain *why*, not obvious syntax.
- Database changes: update `prisma/schema.prisma`, run
  `npx prisma migrate dev --name <clear_name>`, update `prisma/seed.ts` if demo
  data is affected.

## Security checklist for new endpoints

- Is the route authenticated and role-checked?
- Is the input validated with Zod?
- Are ownership rules checked (customer owns record / technician assigned)?
- Is HTML sanitised before storage?
- Are uploaded files type/size limited and downloaded only after authorisation?
- Are rate limits applied to public forms and auth?
- Does the response avoid leaking personal data of other users?

## Checks before finishing

```bash
npm run build      # prisma generate + tsc
npm test           # unit + API tests
```

## Handoff

If the frontend needs a new field or endpoint, record it in
`docs/handoffs/backend-to-frontend.md` with the exact response shape.
