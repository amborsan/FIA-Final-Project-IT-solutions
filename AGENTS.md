# Project agent rules (read this first)

This repository is a graduation project built by three junior developers:

| Person | Owns | May read | Must not edit |
| --- | --- | --- | --- |
| Backend developer | `server/` | `client/` | `client/` |
| Frontend developer 1 | `client/src/routes`, `components`, `i18n` | `server/` | `server/`, `client/src/lib/api.ts` contract |
| Frontend developer 2 | `client/src/context`, `lib`, styling, tests | `server/` | `server/`, generated route tree |

## Hard rules for AI agents

1. **Frontend agents must not touch `server/` at all.** No edits to Prisma,
   Express, migrations, seeds, environment files, tests or package files. If an
   API change is needed, create a ticket in `docs/handoffs/tickets/`, link it in
   `docs/handoffs/frontend-to-backend.md`, and tell the backend developer only.
   The full contract is `client/Agent.md`; per-developer prompts are in
   `client/agents/`.
2. **Backend agents must not touch `client/`.** UI work belongs to the frontend
   developers.
3. Never edit generated files: `client/src/routeTree.gen.ts`,
   `server/src/generated/prisma/**`.
4. Keep the API contract stable. If it must change, update
   `docs/api.md`, `client/src/lib/types.ts` and `docs/handoffs/` together.
5. Use the existing stack and patterns. Do not introduce a second state manager,
   a different ORM, a different router or a CSS framework.
6. Keep code junior-friendly: clear names, short comments explaining *why*, no
   clever abstractions, no unnecessary dependencies.
7. Every user-facing string must exist in English and German.
8. Do not commit secrets. `server/.env` is ignored; use `.env.example`.
9. Run the relevant checks before finishing:
   - frontend: `cd client && npm run build`
   - backend: `cd server && npm run build && npm test`
10. Do not weaken security controls (CSRF, role checks, validation, rate limits,
    sanitising, cookie flags) to make a demo easier.

## Where to put things

- New API endpoint: `server/src/routes/*.routes.ts` + Zod schema in
  `server/src/validation/schemas.ts` + docs in `docs/api.md`.
- New page: `client/src/routes/*.tsx` + nav entry in `client/src/components/nav.ts`
  if it is a dashboard page.
- New translation: `client/src/i18n/translations.ts` (both `en` and `de`).
- New shared UI: `client/src/components/`.
- New database field: Prisma schema + migration + seed (only backend developer).

## Handoff files

- `docs/handoffs/tickets/` — one backend request ticket per change (template +
  rules inside).
- `docs/handoffs/frontend-to-backend.md` — index of open/done backend tickets.
- `docs/handoffs/backend-to-frontend.md` — backend announces contract changes here.
- `client/Agent.md` — binding frontend agent contract (no backend edits).
- `client/agents/frontend-developer-1/Agent.md` / `-2/Agent.md` — role prompts.

## Useful commands

```bash
# Backend
cd server && npm run dev
cd server && npm test && npm run build

# Frontend
cd client && npm run dev
cd client && npm run build
```
