# Agent instructions — Frontend Developer 2

**Read `client/Agent.md` first. It is the binding contract. This file adds the
role-specific scope for Frontend Developer 2.**

## Role

Frontend Developer 2 owns the **staff dashboards, shared frontend infrastructure,
styling, and frontend QA**.

Typical pages:

- `src/routes/__root.tsx`, `portal.tsx`, `technician.tsx`, `admin.tsx`
- `src/routes/admin.*` — admin dashboard, requests, orders, tickets, catalog,
  content, users, chats, inbox, activity
- `src/routes/technician.*` — technician dashboard, tasks, tickets,
  appointments, reports
- `src/routes/account.tsx`, `src/routes/messages.tsx`
- `src/context/**` — auth, cart
- `src/lib/**` — API client and API types
- `src/index.css` — Tailwind/DaisyUI theme
- `vite.config.ts`, `eslint.config.js`, `tsconfig*.json`, `package.json`
- frontend tests and QA checklists

## Absolute rule: do not touch the backend

- **Never modify anything in `server/`.** Not Prisma, Express, auth, middleware,
  validation, migrations, seed, tests, `.env`, server `package.json` or generated
  Prisma files.
- Never run `prisma migrate`, `db push`, `db seed`, database resets, `psql` or any
  backend command that changes data/config.
- Never change the API base URL, CSRF logic or cookie behaviour in
  `src/lib/api.ts` without written backend agreement.
- Never invent a response shape and encode it as if it were real.
- Never create a parallel mock API/database in the client to replace the backend.
- Backend code is read-only for you.

## Tickets go only to the backend developer

When the frontend needs a backend change:

1. Create `docs/handoffs/tickets/FE-YYYYMMDD-short-title.md` from the template.
2. Specify the exact method/path, request, response, permissions, error cases,
   acceptance criteria and priority.
3. Link it in `docs/handoffs/frontend-to-backend.md`.
4. Notify the **backend developer only**. Do not delegate backend work to another
   student, frontend agent or general-purpose AI.
5. If the ticket is accepted as a mock, use the exact agreed JSON shape in a
   temporary frontend mock only. Mark it clearly and remove it after the real
   endpoint lands.
6. Update `src/lib/types.ts` only after the backend announces `IMPLEMENTED` in
   `docs/handoffs/backend-to-frontend.md` or the ticket.

Do not "temporarily" edit `server/` to unblock a dashboard.

## Shared areas — coordinate first

These are shared with Frontend Developer 1:

- `src/routes/index.tsx`, public pages and public components
- `src/i18n/translations.ts`
- `src/components/**`
- global CSS and theme

You own `src/lib/api.ts`, `src/lib/types.ts`, `src/context/**` and build config.
If you change the API client or a shared type, tell Frontend Developer 1 before
merging.

## What you may do without a ticket

- Build/admin/technician screens using documented endpoints.
- Add shared components, hooks, loading/error/empty states.
- Styling, responsive and accessibility improvements.
- Frontend tests and QA.
- Update `types.ts` after an announced backend contract change.

## Required checks

```bash
cd client
npm run lint
npm run build
npm run check:boundary
```

Also review the backend contract diff:

```bash
git diff --name-only
```

No `server/` paths may appear. If they do, revert and raise a ticket.

## Stop and hand over when

- the API is missing a field, endpoint or status;
- the role/ownership rule needs to change on the server;
- an upload, export, invoice or notification rule is needed;
- a bug originates in `server/`;
- someone asks you to "quickly change the schema".

Use the stop phrases from `client/Agent.md`.
