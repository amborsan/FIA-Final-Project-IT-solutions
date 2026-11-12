# FE-20261110 — Verify the displayed demo customer credentials

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend developer |
| AI agent / session | Codex, DaisyUI to shadcn migration |
| Date | 2026-11-10 |
| Priority | `MEDIUM` |
| Frontend work blocked? | `NO` — migration continues; fresh-session demo login verification is blocked |
| Related page/route | `/login`, `/portal` |
| Related existing endpoint | `POST /api/auth/login` |
| Agreed mock contract | `NONE` |

## Problem

The customer demo button currently displayed by `/login` fills `customer@fia-it.de`
and the demo password from the existing source. In a fresh Chromium session at
`http://127.0.0.1:5173`, submitting these values returns HTTP 401 and remains on
`/login`. No authentication code, endpoint, credentials, cookies or CSRF handling
was changed by the UI migration. An existing browser session can still display
the customer portal, which does not verify that a new login works.

## Why the frontend cannot solve it

Account availability, stored passwords, activation state and credential validation
belong to the backend. Please confirm the intended demo credentials before any
frontend copy change. A 401 alone does not establish which backend condition is
responsible.

## Proposed backend change

- **Method + path:** Verify the existing `POST /api/auth/login`; no new endpoint requested.
- **Request body/params:** Existing `{ "email": "customer@fia-it.de", "password": "<password displayed by the demo button>" }`.
- **Expected response:** Existing documented `{ "user": User }` response plus the normal session cookie. Keep `User` aligned with `client/src/lib/types.ts`.
- **Permissions:** Public login; successful authentication grants only the existing customer role and ownership rules.
- **Validation/errors:** Invalid credentials must continue to return 401; retain CSRF and other security checks.
- **Database impact:** Backend developer to confirm whether the intended demo account exists and is active. No schema change requested.
- **Migration required:** `NO` schema migration requested; any data correction is owned by the backend developer.

## Acceptance criteria

- [ ] Backend confirms the intended demo account and password for the current local environment.
- [ ] A fresh browser session can sign in using the confirmed customer demo credentials.
- [ ] Login returns the existing documented user shape and redirects to `/portal`.
- [ ] Invalid credentials continue to fail without weakening security.
- [ ] Backend developer updates documentation only if the intended demo setup differs.

## Frontend workaround / temporary plan

Fresh-session demo login verification stays blocked. No production mock is used.
Continue the UI migration and public-page tests. Preserve the failing E2E test
so the team can rerun it after the demo setup is confirmed.

## Backend decision (only the backend developer writes this)

- **Decision:**
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] Rerun `npm run test:e2e` after backend confirmation.
- [ ] Update frontend demo labels/values only if the backend confirms a change.
- [ ] Keep current API types if the documented contract is unchanged.
- [ ] Set status to `FRONTEND CONSUMED` and move the index link after verification.
