# FE-20261119 — Restore the local development API

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend team |
| AI agent / session | Codex frontend regression investigation |
| Date | 2026-11-19 |
| Priority | `BLOCKER` |
| Frontend work blocked? | `YES` for live data and authenticated flows |
| Related page/route | Frontend routes that use `/api` |
| Related existing endpoint | `GET /api/health` |
| Agreed mock contract | `NONE` |

## Problem

The running frontend returns HTTP 200 for `http://127.0.0.1:5173/` and
HTTP 502 for `http://127.0.0.1:5173/api/health`. A direct request to
`http://localhost:3000/api/health` fails to connect. Port 3000 has no listener
in this environment.

## Why the frontend cannot solve it

The Vite development proxy forwards `/api` to the documented Express listener
on port 3000. The backend developer needs to inspect the service startup and
restore the listener. The reason the API process is absent remains unverified.
The Express entry point connects to PostgreSQL before opening the HTTP listener,
so the startup logs should distinguish a database connection failure from a
service that was never started.

## Proposed backend change

- **Method + path:** Restore the existing `GET /api/health` on the documented local port.
- **Request body/params:** None.
- **Expected response:** HTTP 200 with the existing JSON health response containing `status: "ok"` and `service`.
- **Permissions:** Public health check. Existing application endpoints retain their access requirements.
- **Validation/errors:** Diagnose startup from the local backend logs. Preserve existing endpoint validation and error responses.
- **Database impact:** None requested.
- **Migration required:** `NO`.

## Acceptance criteria

- [ ] The API listens at the documented local proxy target.
- [ ] Direct and proxied `GET /api/health` both return HTTP 200 and the existing health response.
- [ ] A proxied `GET /api/services` returns the documented service list.
- [ ] Any remaining demo-account login failures are tracked in [FE-20261110](FE-20261110-demo-customer-login.md).

## Frontend workaround / temporary plan

Live data and authenticated flow verification remain blocked until the local API is available.

## Backend decision (only the backend developer writes this)

- **Decision:**
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] Rerun the API-dependent browser tests once the API is reachable.
- [ ] Update the ticket status and move the index link after verification.
