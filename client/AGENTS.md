# AGENTS.md: Frontend workspace

**Binding contract:** read [`Agent.md`](./Agent.md) before any task.
**Design spec:** read [`DESIGN.md`](./DESIGN.md) before any UI task.
Role-specific prompts: [`agents/README.md`](./agents/README.md).

If these files disagree, the order of priority is:
`Agent.md` first, then this file, then `DESIGN.md`. If a design request would
break a rule in `Agent.md`, stop and ask the frontend developer.

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
4. Tell the **frontend developer (the user)** that the ticket is waiting and ask
   them to pass it to the backend developer. You cannot contact people yourself.
5. Do not implement the backend change yourself or fake it in production code.

**Explicitly forbidden:**

- Editing anything in `server/`, `server/.env`, Prisma, migrations, seeds,
  routes, middleware, tests or server `package.json`.
- Running `prisma migrate`, `db push`, `db seed`, resets, `psql` or backend
  scripts.
- Editing `docs/api.md`, `docs/database-erd.md` or `docs/architecture.md` to fit
  frontend code.
- Editing `client/src/routeTree.gen.ts` (generated).
- Adding a mock server, second API or direct database access inside the client.
- Changing the API base URL/CSRF/cookie logic without backend agreement.
- Adding analytics or non-essential cookies.

## Frontend rules

- Use the existing stack: React + TypeScript (strict) + TanStack Router/Query +
  shadcn/ui (Radix) + Tailwind CSS v4. **DaisyUI is removed. Never reintroduce it.**
- Add every user-facing string in both `en` and `de`.
- Use `useI18n()` and `pick()`; never hardcode UI text.
- Reuse existing components in `client/src/components/` before creating new ones.
- Mobile-first: usable at 360 px.
- Never store tokens in localStorage.
- Use `RichText` only for server-sanitised CMS HTML.
- Do not add a library that is not approved in `Agent.md` section 6. Stop and ask.
- Run the checks below.

## Design system (DESIGN.md)

The project is migrating to the Asana-inspired visual style defined in
`DESIGN.md` (approved by the frontend developer). It defines colors, typography
(Geist), radius, spacing and component rules.

- **Tokens live in `client/src/styles/tokens.css`.** Components must use tokens
  (CSS variables or Tailwind classes backed by them). Never hardcode hex colors
  or arbitrary pixel values in components.
- If a value from `DESIGN.md` is missing in `tokens.css`, add it to
  `tokens.css` first, then use it. Keep the shadcn variable mappings working.
- Keep these signature rules: primary CTA is a near-black pill (never indigo),
  indigo is for panels only, coral only inside mockups, no card shadows
  (hairline borders instead). The full list is in the Do's and Don'ts of
  `DESIGN.md`.
- **Font loading needs approval.** Do not install a font package or add an
  external font `<link>` on your own. Ask the user first. Prefer self-hosting
  Geist (no requests to third-party servers), because this project must not add
  tracking and serves German users.
- **Dark mode:** the dark tokens exist in `DESIGN.md`, but do not build a dark
  theme or a theme toggle unless the user asks for it.
- Never edit `DESIGN.md` to make code fit. If the spec and the code disagree,
  report it in "Decisions to review" in your final report.

### Migration to the new style

- **New UI** always follows `DESIGN.md`.
- **Existing pages** are migrated only when assigned. One page or one shared
  component per task. Do not restyle anything outside your task.
- Migration order:
  1. `tokens.css`: add the `DESIGN.md` tokens. Keep shadcn mappings and existing
     `ds-*` styles working until they are replaced.
  2. Geist setup (after the user approves how to load it).
  3. Shared primitives and layout: `components/ui/` (Button, Tabs, Card, Input),
     the states in `components/ui.tsx`, Header, DashboardShell.
  4. Public site and customer portal (Frontend Developer 1).
  5. Admin and technician dashboards (Frontend Developer 2).
- Remove a `ds-*` style only after no page uses it. Never delete them in bulk.
- Migration is **style only**. Do not change behavior, API calls, i18n keys,
  validation or accessibility while restyling.
- After each page: check at 360 px in both `en` and `de` (German strings are
  often longer), then run the checks below.
- Use `style(ui)` or a concrete scope in the commit message.
- Use only the visual language of Asana. Do not use Asana's name, logo,
  illustrations or copy. Use Geist, not Asana's proprietary fonts.
- The project's own logo and brand illustrations stay as they are. If they clash
  with the new palette, stop and ask the user.

## Non-negotiable checks

```bash
cd client
npm test
npm run test:e2e
npm run lint
npm run build
npm run check:boundary
```

`check:boundary` fails if any `server/` file changed. If it fails, **revert the
backend change** and create/update a ticket. Never bypass or edit the check.

Do not start, seed or reset the backend from test setup. E2E uses the already
running API.

## Where to work

- Frontend Developer 1: public site + customer portal, see
  `agents/frontend-developer-1/Agent.md`.
- Frontend Developer 2: admin/technician dashboards, shared infrastructure,
  styling and QA, see `agents/frontend-developer-2/Agent.md`.
- Shared files (`components`, `i18n`, `styles/tokens.css`, `DESIGN.md`):
  coordinate before changing.

## Backend tickets

- Template: `docs/handoffs/tickets/TEMPLATE.md`
- Index: `docs/handoffs/frontend-to-backend.md`
- One ticket = one backend change.
- Only the backend developer edits the **Backend decision** section.
- Wait for `IMPLEMENTED` (or `AGREED MOCK` with an exact JSON shape) before
  updating `client/src/lib/types.ts` and finishing the UI.

## Git

- Use Conventional Commits for new work, for example `feat(ui): add pill button`.
- Do not commit, amend, push or rewrite history unless asked.

## Final report

End every task with the report format from `Agent.md` section 11
(Summary, Files changed, Checks, Waiting on backend, Decisions to review).
