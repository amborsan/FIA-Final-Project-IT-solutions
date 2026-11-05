# AGENTS.md — Frontend workspace

**Binding contract:** read [`Agent.md`](./Agent.md) before any task.
Role-specific prompts: [`agents/README.md`](./agents/README.md).

## The absolute rule

**You work in `client/` only. The backend in `server/` is owned by the backend
developer. Never edit, create, delete, format or run commands against `server/`
for any reason.**

If a task needs a new endpoint, field, database change, permission change,
validation change or a server bug fix:

1. Stop work on that part.
2. Create a ticket from `docs/handoffs/tickets/TEMPLATE.md` under
   `docs/handoffs/tickets/FE-YYYYMMDD-short-title.md`.
3. Link it in `docs/handoffs/frontend-to-backend.md`.
4. Tell the **backend developer only**.
5. Do not implement the backend change yourself or fake it in production code.

**Explicitly forbidden:**

- Editing anything in `server/`, `server/.env`, Prisma, migrations, seeds,
  routes, middleware, tests or server `package.json`.
- Running `prisma migrate`, `db push`, `db seed`, resets, `psql` or backend
  scripts.
- Editing `docs/api.md`, `docs/database-erd.md` or `docs/architecture.md` to fit
  frontend code.
- Editing `src/routeTree.gen.ts` (generated).
- Adding a mock server, second API or direct database access inside the client.
- Changing the API base URL/CSRF/cookie logic without backend agreement.
- Adding analytics or non-essential cookies.

## Frontend rules

- Use the existing stack: React + TanStack Router/Query + Tailwind + DaisyUI.
- Add every user-facing string in both `en` and `de`.
- Use `useI18n()` and `pick()`; never hardcode UI text.
- Keep the existing components and design tokens.
- Mobile-first: usable at 360 px.
- Never store tokens in localStorage.
- Use `RichText` only for server-sanitised CMS HTML.
- Run the checks below.

## Non-negotiable checks

```bash
cd client
npm run lint
npm run build
npm run check:boundary
```

`check:boundary` fails if any `server/` file changed. If it fails, **revert the
backend change** and create/update a ticket. Never bypass or edit the check.

## Where to work

- Frontend Developer 1: public site + customer portal, see
  `agents/frontend-developer-1/Agent.md`.
- Frontend Developer 2: admin/technician dashboards, shared infrastructure,
  styling and QA, see `agents/frontend-developer-2/Agent.md`.
- Shared files (`components`, `i18n`, theme): coordinate before changing.

## Backend tickets

- Template: `../docs/handoffs/tickets/TEMPLATE.md`
- Index: `../docs/handoffs/frontend-to-backend.md`
- One ticket = one backend change.
- Only the backend developer edits the **Backend decision** section.
- Wait for `IMPLEMENTED` before updating `src/lib/types.ts` and finishing the UI.
