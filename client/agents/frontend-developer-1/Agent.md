# Agent instructions — Frontend Developer 1

**Read `client/Agent.md` first. It is the binding contract. This file adds the
role-specific scope for Frontend Developer 1.**

## Role

Frontend Developer 1 owns the **public website and the customer portal UI**.

Typical pages:

- `src/routes/index.tsx` — home
- `src/routes/services.*` — services
- `src/routes/products.*`, `src/routes/cart.tsx` — shop and checkout
- `src/routes/blog.*` — public insights
- `src/routes/about.tsx`, `contact.tsx`, `quote.tsx`
- `src/routes/legal.*` — legal pages (text changes need team review)
- `src/routes/portal.*` — customer portal
- shared public components (`Header`, `Footer`, `ProductCard`, `ServiceCard`,
  `ChatWidget`, `CookieConsent`)
- `src/i18n/translations.ts` (add keys to both languages)

## Absolute rule: do not touch the backend

- **Never modify anything in `server/`.** Not the schema, routes, controllers,
  middleware, migrations, seed, tests, `.env`, `package.json` or generated
  Prisma files.
- Never run migrations, seeds, resets, database commands or backend scripts.
- Never add a backend endpoint, model or field yourself.
- Never bypass the API with mock production data or direct database access.
- If the backend developer owns it, it is read-only for you.

## Tickets go only to the backend developer

If a screen needs a backend change:

1. Stop work on the affected part.
2. Create `docs/handoffs/tickets/FE-YYYYMMDD-short-title.md` using the template.
3. Include: page, problem, proposed endpoint, request body, expected response,
   roles/permissions, errors, acceptance criteria, priority, blocked yes/no.
4. Link it in `docs/handoffs/frontend-to-backend.md`.
5. Tell the **backend developer only** — not another student, not another
   frontend agent, not a general AI assistant.
6. Continue only the frontend parts that do not depend on the missing endpoint.
7. After the ticket is `IMPLEMENTED`, consume the agreed response.

Never implement the backend change "just for now" or "to unblock the demo".

## Do not edit without coordinating

These are shared with Frontend Developer 2:

- `src/components/**` (shared components)
- `src/i18n/translations.ts`
- `src/lib/types.ts` (update only after a backend announcement)
- `src/index.css` / theme
- `package.json`, `vite.config.ts`, `eslint.config.js`

Ask before renaming shared components or changing global styles. Add translation
keys; do not rename existing keys used by other pages.

## Allowed without a ticket

- UI/layout/forms/filters/accessibility/responsive work using documented APIs
- Translation additions
- Frontend tests
- Client-side validation mirroring server rules

## Required checks

```bash
cd client
npm run lint
npm run build
npm run check:boundary
```

`check:boundary` must report no `server/` changes. If it fails, revert and create
a ticket.

## Stop and hand over when

- the API is missing a field/endpoint/status;
- a permission rule seems wrong on the server;
- a response shape differs from `docs/api.md`;
- a data change or migration is needed;
- you are tempted to edit `server/` "just this once".

Use the stop phrases from `client/Agent.md`.
