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

### Local verification — 2026-11-16

The user requested repair of all four displayed demo cards. The running local
API rejected `admin@fia-it.de` with 401, but accepted the README-listed Admin,
Technician, Customer and Business customer accounts using the previous demo domain with 200.
Each returned the expected role and a valid `/auth/me` session. The frontend
cards were updated to these verified addresses, with regression coverage for
all four cards. The local customer login is no longer blocked by the original
card/address mismatch. No backend decision, seed, database or auth code was
changed. Confirmation of the canonical demo domain for other environments
remains with the backend team.

- [ ] Rerun `npm run test:e2e` after backend confirmation.
- [ ] Update frontend demo labels/values only if the backend confirms a change.
- [ ] Keep current API types if the documented contract is unchanged.
- [ ] Set status to `FRONTEND CONSUMED` and move the index link after verification.

### Branding alignment — 2026-11-18

The user confirmed **IT Solutions.** and **fia-it.de** as the canonical branding. The four frontend demo shortcuts and browser-test defaults now use fia-it.de, matching the committed seed. The November 16 verification above remains a historical result for the previous local database. No backend decision or database content was changed. If the local database still contains earlier demo emails, the backend developer must align it before real login verification can pass.

Verification on November 18: all four shortcuts fill the expected fia-it.de email in both English and German. The real API login for admin@fia-it.de returns HTTP 401, and both admin layout checks remain on /login. The backend developer must check the configured local demo accounts; the frontend domain must remain fia-it.de. No backend files or database data were changed.

### Root cause confirmed through the running API — 2026-11-18

A direct login request with a valid CSRF token returned HTTP 401 for admin@fia-it.de and the generic incorrect-credentials response. The previous-domain admin address authenticated with the same seeded password and returned ADMIN with ID 10000000-0000-4000-8000-000000000001. An authenticated GET /api/admin/users query found no active fia-it.de users and found all five previous-domain demo users with the fixed IDs from the committed seed. The diagnostic session was logged out successfully. No server files, environment configuration, or account records were changed; normal login created its session and activity entry.

The seed looks up each demo user by fixed ID and has an empty update object. Its create object uses fia-it.de, but existing rows keep their previous email. Rerunning the unchanged seed cannot repair this database. The login controller looks up the submitted email exactly and rejects missing/deleted accounts or incorrect passwords. The evidence establishes stale demo email data for the known fixed-ID admin; the seeded password still works for that existing account.

#### Required backend fix

1. Confirm that the database being corrected is the one used by the running local API. Check for canonical-email collisions, including soft-deleted rows, before making changes.
2. Rename the five existing demo users in place, using their fixed seed IDs: suffix 001 to admin@fia-it.de, 002 to tech@fia-it.de, 003 to tech2@fia-it.de, 004 to customer@fia-it.de, and 005 to business@fia-it.de. The shared ID prefix is 10000000-0000-4000-8000-000000000. Preserve IDs, roles, password hashes, deletion state, and relationships. Do not reset or recreate the database.
3. Add an explicit, guarded development/demo data repair or update the demo seed's update branch for these known accounts so an existing demo database can adopt the canonical addresses. Do not reset passwords, reactivate deleted accounts, rewrite unrelated users, or apply demo credential changes in production automatically. A schema migration is not required for an email-only correction.
4. Verify that admin@fia-it.de with the seeded admin password returns 200 and ADMIN, that GET /api/auth/me returns the same fixed ID and canonical email, and that the frontend reaches /admin. Verify the other demo shortcuts. Invalid credentials must still return 401; preserve CSRF, cookies, and rate limits. Rerun the demo-login browser tests.

No API contract change or frontend address rollback is needed. This investigation does not read database connection secrets or inspect deleted rows; checking for collisions and applying the repair remain backend responsibilities.

### Repeat report — 2026-11-18

The user reported that the demo shortcuts cannot log in again. Fresh HTTP
requests through `http://localhost:5173/api`, each obtaining a valid CSRF token
and cookie first, returned HTTP 401 with `Email or password is incorrect.` for
all four displayed accounts: `admin@fia-it.de`, `tech@fia-it.de`,
`customer@fia-it.de`, and `business@fia-it.de`. The submitted passwords match
the current demo cards and SETUP.md. The API is reachable; this is not a missing
API connection or a CSRF rejection. The previously documented canonical-email
data repair is still required. No frontend authentication, backend files,
database records, or security controls were changed during this repeat check.
