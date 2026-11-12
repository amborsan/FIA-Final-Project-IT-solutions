# Agent.md: Frontend AI agent contract

**This file is binding for every AI agent working on behalf of a frontend
developer in this project.** Read it before every task. If a request conflicts
with this file, stop and ask the frontend developer.

> **The one-line rule:** You may change the frontend only. The backend belongs
> to the backend developer. If the backend must change, stop coding and create a
> backend request ticket.

There is no exception. "It is a tiny change", "it is only one field", "the demo
is easier this way" and "I can fix it faster" are not exceptions.

---

## 1. Project overview

| Item         | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | `client/`: React, TypeScript (strict), TanStack Router, React Query |
| UI           | shadcn/ui (Radix) + Tailwind CSS v4                                 |
| i18n         | `en` and `de`, in `client/src/i18n/translations.ts`                 |
| Backend      | `server/`: Express, Prisma (read-only for you)                      |
| API contract | `docs/api.md` (the only source of truth for response shapes)        |
| API types    | `client/src/lib/types.ts`                                           |
| API client   | `client/src/lib/api.ts`                                             |
| Tests        | Vitest + Testing Library (jsdom); Playwright E2E                    |

Folders inside `client/src/` (actual structure):

- `components/`: shared components such as Header, DashboardShell, ProductCard;
  `components/ui.tsx` exports shared status, loading, error and empty states.
- `context/`: authentication and local cart state.
- `routes/`: TanStack Router flat file-based pages, including dotted filenames.
- `lib/`: API client and documented types; `i18n/`: EN/DE translations.
- `styles/tokens.css`: shared design values; `index.css`: imports and base styles.
- `test/setup.ts`: test-only DOM setup. Tests live beside their source.

DaisyUI remains removed. New UI uses shadcn/ui (Radix) + Tailwind v4.
Existing project-owned components and ds-* styles may remain until a requested
migration; do not mass-replace existing pages or reintroduce DaisyUI.

---

## 2. Before every task

1. Read this file.
2. Read the relevant part of `docs/api.md` and `client/src/lib/types.ts`.
3. Check `components/`, `components/ui.tsx` and related route/context files
   for something you can reuse.
4. Decide: can the task be done with the existing API? If yes, stay in `client/`.
   If no, or if you are unsure, go to section 4.

---

## 3. Who owns what

| Area                                                                   | Owner                              | Your AI agent                                        |
| ---------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `server/` (Express, Prisma, migrations, seed, auth, API tests, `.env`) | Backend developer only             | Read-only at most. Never write.                      |
| `docs/api.md`, `docs/database-erd.md`, `docs/architecture.md`          | Backend developer / team leads     | Read only. Never edit to make a frontend change fit. |
| `client/`                                                              | Frontend developers                | Your workspace                                       |
| `docs/handoffs/tickets/FE-*.md`                                        | Frontend requests, backend answers | Create/update your own ticket files                  |
| `docs/handoffs/frontend-to-backend.md`                                 | Shared index                       | Add a link only                                      |
| `docs/handoffs/backend-to-frontend.md`                                 | Backend announcements              | Read only                                            |

Only the backend developer may implement backend changes. Do not ask another
agent, student or general AI assistant to do it either.

---

## 4. Backend boundary

### 4.1 Never do any of the following

- Edit, create, delete, rename, move or format anything in `server/`
  (schema, migrations, seed, routes, controllers, middleware, auth, validation,
  tests, `package.json`, `.env*`).
- Run commands that write to the backend: `prisma migrate`, `prisma db push`,
  `prisma db seed`, `npm run db:*`, direct `psql`, seed/reset scripts.
- Start, stop or reconfigure the backend in a way that changes data or config.
  You may **use** the running API over HTTP.
- Add a second API, mock server, database layer, ORM or direct DB access in
  the client.
- Copy backend source into `client/`.
- Change the base URL, CSRF logic or cookie behaviour in `client/src/lib/api.ts`
  without the backend developer's written agreement. Other edits to `api.ts`
  (new typed helpers for documented endpoints) are allowed.
- Invent API response shapes that are not in `docs/api.md` and build production
  UI on them.
- Read `server/.env` or any secret. Never copy secrets into the frontend.
- Weaken security or privacy controls to make a screen work.
- Edit `client/src/routeTree.gen.ts` (generated by TanStack Router).

Reading `server/src` to understand the API is allowed. Reading is not
permission to modify.

### 4.2 What counts as a backend change

If a task needs any of these, stop and create a ticket:

- a new endpoint, route or HTTP method;
- a new field, model, enum value or relation;
- a changed response shape, field name, status value or error code;
- a changed permission, role or ownership rule;
- a new file upload/download rule;
- email, notification, invoice, PDF or export logic;
- server-side validation, sanitising, rate limiting or auth changes;
- a bug that lives in `server/`, even a small one;
- anything that needs a backend command, migration or seed change.

If you are not sure, treat it as a backend change.

### 4.3 Ticket workflow

1. Stop coding the affected part. Continue with parts that do not depend on it.
2. Check `docs/api.md` and `docs/handoffs/frontend-to-backend.md` to confirm
   the endpoint does not already exist.
3. Create one ticket from `docs/handoffs/tickets/TEMPLATE.md`, named
   `FE-YYYYMMDD-short-title.md`.
4. Fill every field: page, problem, proposed endpoint, request body/params,
   expected JSON response, permissions, errors, acceptance criteria, priority,
   and whether frontend work is blocked.
5. Add a link under **Open tickets** in `docs/handoffs/frontend-to-backend.md`.
6. **Tell the frontend developer (the user) that the ticket is waiting and ask
   them to pass it to the backend developer.** You cannot contact people
   yourself.
7. Wait for status `IMPLEMENTED`, or `AGREED MOCK` with an exact JSON shape.
8. After implementation, update `client/src/lib/types.ts` to match the agreed
   response, then continue the UI.
9. Set the ticket to `FRONTEND CONSUMED` and move its link under **Done**.

Ticket rules:

- One ticket = one backend change.
- A ticket is a request, not permission to modify the backend.
- Never edit a ticket's **Backend decision** section.
- The ticket is the source of truth, not chat messages.
- If blocked, show the ticket to the user. Do not guess.

### 4.4 Mock policy

Build against a mock **only if** the backend developer wrote `AGREED MOCK` in
the ticket with the exact JSON shape. The mock lives in the frontend
test/story layer, never in production API calls. Remove it when the real
endpoint ships.

---

## 5. Frontend work allowed without a ticket

- Pages, layouts, forms, tables, filters, empty/loading/error states.
- Components, styling, responsive and accessibility fixes.
- EN/DE translation keys.
- React Query usage of existing documented endpoints.
- Client-side validation that mirrors server rules (never replaces them).
- Frontend tests and documentation inside `client/`.

---

## 6. UI library (shadcn/ui + Tailwind)

- Use shadcn/ui and Tailwind CSS v4. Do not add a second UI library, CSS
  framework or router.
- shadcn components live in `client/src/components/ui/`. Add new ones only with
  `npx shadcn@latest add <name>`, then adapt the generated code if needed.
  Do not hand-write a component that shadcn already provides.
- Use `cn()` from `@/lib/utils` to merge class names.
- Theme tokens (colors, typography, spacing, radius and shadcn mappings)
  live in `src/styles/tokens.css`, imported by `src/index.css`. Do not
  hardcode colors or arbitrary pixel values in components.
- Do not put business logic, data fetching or translations lookups inside
  `components/ui/`.
- Approved extra libraries: `lucide-react` (icons), `react-hook-form` + `zod`
  (forms), `@tanstack/react-table` (tables). Anything else needs frontend team
  agreement: stop, explain why, and ask the user. Approved does not mean installed.
- Never edit server dependencies.

## 7. Component structure

- Reuse components in `client/src/components/`; generic state components are
  exported from the existing `ui.tsx` file. New shadcn primitives live in
  `components/ui/`; these two paths coexist without moving old imports.
- Keep route-specific UI beside/in its route until reuse justifies extraction.
  Shared components must not import route modules. Context provides shared state;
  `lib/` holds non-UI helpers and API types.
- Prefer named PascalCase component files, short functions and explicit props.
  Existing multi-export files are valid; do not split them solely for a rule.
- Tests: colocate `*.test.ts(x)` with source. Browser tests belong in
  `client/e2e/*.spec.ts`, outside the generated routing directory.

---

## 8. Coding conventions

- TypeScript strict. No `any`. Prefer types from `client/src/lib/types.ts`.
- Components: `PascalCase.tsx`. Hooks: `useThing.ts`. Helpers: `camelCase.ts`.
- Function components only. Type props with an explicit interface or type.
- Server data goes through React Query. Do not copy server data into local
  state.
- Forms: preserve existing controlled React state and native HTML validation.
  Do not mandate react-hook-form/zod: these are not installed. Any future
  migration requires an explicit request. Messages use translation keys.
- Tests: Vitest + React Testing Library + user-event + jest-dom in jsdom.
  Run `npm test` for a single run and `npm run test:watch` during development.
  Playwright: `npm run test:e2e`; browser binaries are installed separately with
  `npx playwright install chromium`. E2E uses the real running API at the existing
  Vite proxy target. Never start, seed or reset the backend from test setup.
  Login uses the documented demo account and creates only a session; cart tests
  change browser-local storage, not orders. Keep authenticated storage/traces out
  of Git. Do not invent API mocks; existing agreed-mock rules still apply.
  Lint/build are complementary checks, not replacements for tests.
- Commits: use Conventional Commits for new work:
  `<type>(<scope>): <short imperative summary>`. Types: `feat`, `fix`,
  `refactor`, `style`, `docs`, `test`, `chore`. Use concrete scopes such as
  `home`, `portal`, `admin`, `technician`, `ui` or `i18n`. Example:
  `fix(home): keep bees inside mobile hero`. Existing history is mixed; this
  convention applies going forward, not retroactively. Keep unrelated work out
  of the same commit, review the staged diff and never stage secrets.
  Do not commit, amend, push or rewrite history unless asked.

---

## 9. Language, accessibility and security

- Every user-facing string goes into **both** `en` and `de` in
  `src/i18n/translations.ts`. Never hardcode UI text.
- Use `useI18n().t(...)`, `pick(record.nameEn, record.nameDe)`, `formatDate`,
  `formatMoney`.
- Pages must work at 360 px width (check in browser devtools or a responsive
  test).
- Interactive elements must be keyboard reachable and have accessible names.
  Preserve native semantics, accessible names, focus return and Escape dismissal.
- Never store auth tokens in `localStorage`. The session cookie stays HTTP-only.
- Use `RichText` only for server-sanitised CMS HTML. Do not add other
  `dangerouslySetInnerHTML`.
- Use `downloadFile()` for protected files.
- No analytics, tracking pixels or non-essential cookies.

---

## 10. Definition of done

Run:

```bash
cd client
npm test
npm run test:e2e
npm run lint
npm run build
npm run check:boundary   # fails if server/ files were changed
```

Confirm:

- [ ] No file under `server/` changed.
- [ ] No `docs/api.md`, ERD or architecture edit was made to fit a UI.
- [ ] Any needed backend change has a ticket and is not faked in production code.
- [ ] No secrets or `.env` content in the diff.
- [ ] Every new string exists in both `en` and `de`, and the page was checked in
      both languages.
- [ ] New UI uses shadcn/ui and Tailwind, with no DaisyUI classes.
- [ ] New files follow section 7 (location and dependency direction).

If `check:boundary` fails, **revert the backend change** and create or update
the ticket. Never "fix" the check.

---

## 11. Report format

End every task with this report:

```text
Summary: what was done (1 to 3 lines)
Files changed: list
Checks: lint / build / check:boundary results
Waiting on backend: ticket IDs, or "none"
Decisions to review: where you placed new components and why, or "none"
```

---

## 12. Stop phrases

> "This requires a backend change. I will not modify `server/`. I have drafted
> ticket FE-... and will continue with the frontend parts that do not depend on
> it. Please pass the ticket to the backend developer."

> "The API does not return the field this screen needs. Creating a backend
> request instead of faking the data."

> "The bug is in `server/`. I have written a reproduction ticket for the backend
> developer."

## Approved feedback extension

Be UI Stateful Button and Animated Toast Stack with Motion are approved for quote/contact submission feedback. Source lives in `src/components/beui/`; shared integration lives in `FormFeedback.tsx`. Preserve tokens, EN/DE, native validation and API contracts. Do not expand to other controls without a request.

## Approved design migration extension

The frontend team approved migrating the UI to the visual style in `DESIGN.md`.
This replaces the rule in section 1 against mass-replacing existing pages, but
only in this form: shared tokens and components first, then pages one task at a
time as assigned in `AGENTS.md`. Changes are style only. Preserve API contracts,
EN/DE keys, native validation and accessibility, keep values in
`src/styles/tokens.css`, and never reintroduce DaisyUI. Do not use Asana's name,
logo, illustrations or copy.
