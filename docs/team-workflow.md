# Team workflow

Three junior developers, one small full-stack project. Keep the process as simple
as the code.

## 1. Ownership

| Person | Area | Main folders |
| --- | --- | --- |
| Backend dev | API, database, auth, security | `server/` |
| Frontend dev 1 | Customer + public pages | `client/src/routes`, `components`, `i18n` |
| Frontend dev 2 | Admin/technician UI, styling, QA | `client/src/context`, `lib`, styling, tests |

Rules:

- Only the backend dev changes Prisma, routes, middleware or seeds.
- Only frontend devs change React pages and styles.
- Anyone may **read** the other side for context.
- API contract changes need a handoff note in `docs/handoffs/`.

## 2. Branching

```text
main          stable, builds and tests pass
feature/...   one feature per branch
fix/...       bug fixes
docs/...      documentation only
```

Examples:

- `feature/quote-flow`
- `feature/admin-cms`
- `fix/csrf-header`
- `docs/presentation`

## 3. Commit style

Short imperative messages:

```text
add quote accept endpoint
fix customer ticket filter
docs: add ERD explanation
style: align dashboard cards
```

## 4. Daily routine

1. Pull `main`.
2. Create/switch to your branch.
3. Work in small steps.
4. Run your checks:
   - backend: `npm run build && npm test`
   - frontend: `npm run build`
5. Commit and push.
6. Open a pull request with a short description and a screenshot if UI changed.
7. Another student reviews; the backend dev reviews API changes.

## 5. Definition of done

- The feature works end-to-end in the browser.
- Both languages have labels.
- Loading, empty and error states exist.
- Permissions work (try the wrong role).
- No secret or `.env` committed.
- Build passes.
- Documentation/API updated if the contract changed.
- No unrelated refactors.

## 6. Handoffs

### Frontend → Backend

The backend developer is the **only** person who edits `server/`. Frontend agents
must not implement backend work.

1. Create one ticket in `docs/handoffs/tickets/FE-YYYYMMDD-short-title.md` from
   `docs/handoffs/tickets/TEMPLATE.md`.
2. Link it in `docs/handoffs/frontend-to-backend.md`.
3. Tell the backend developer directly (not another frontend agent or student).
4. Wait for `IMPLEMENTED` before using the new contract in production UI.
5. After finishing the frontend part, mark it `FRONTEND CONSUMED`.

Ticket must include: page, problem, method/path, request body, expected JSON,
permissions, error cases, acceptance criteria, priority and blocked status.

### Backend → Frontend

Use `docs/handoffs/backend-to-frontend.md` with the exact field changes, then
update `client/src/lib/types.ts` and `docs/api.md`.

## 7. AI agent use

- Read `AGENTS.md` before asking an agent to code.
- For frontend AI agents, use `client/Agent.md` plus
  `client/agents/frontend-developer-1/Agent.md` or
  `client/agents/frontend-developer-2/Agent.md`.
- For the backend developer, use `agents/backend-agent.md`.
- Never let a frontend agent edit `server/`.
- Never let a backend agent edit `client/`.
- Frontend agents must create a ticket for backend changes and tell the backend
  developer; they must never implement the backend part.
- Ask the agent to run `npm run lint`, `npm run build` and
  `npm run check:boundary`.
- Review generated code like any other contribution; do not blindly commit.

## 8. Weekly plan suggestion

| Week | Backend | Frontend 1 | Frontend 2 |
| --- | --- | --- | --- |
| 1 | Schema, auth, seed | Layout, design tokens, public pages | Router setup, i18n, dashboard shell |
| 2 | Requests, quotes, orders | Services, shop, quote form | Customer portal |
| 3 | Tickets, appointments, reports | Customer flows | Technician area |
| 4 | Chat, CMS, admin stats | Legal pages, chat widget | Admin area |
| 5 | Tests, security review | QA both languages | QA responsive + docs |
| 6 | Deployment, seed reset | Presentation slides | Demo script, rehearsal |

## 9. Conflict prevention

- Do not reformat files you did not change.
- Keep one component per file.
- Avoid renaming shared components without telling the others.
- Update `docs/api.md` in the same PR as a contract change.
- If a merge conflict is in `routeTree.gen.ts`, delete it and rebuild; never
  hand-merge it.

## 10. Demo day

- Freeze features 48 hours before.
- Run `npm run build` and `npm test` on `main`.
- Seed a clean database.
- Rehearse the demo script twice with a timer.
- Keep a backup build and screenshots.
