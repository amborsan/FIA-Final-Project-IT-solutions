# Backend request ticket template

Copy this file to `docs/handoffs/tickets/FE-YYYYMMDD-short-title.md` and fill
every section. Do not implement the backend change yourself.

---

# FE-000 — <short title>

**Status:** `PROPOSED` / `NEEDS INFO` / `AGREED` / `AGREED MOCK` / `IN PROGRESS` / `IMPLEMENTED` / `REJECTED`

| Field | Value |
| --- | --- |
| Requester | Frontend Developer 1 / 2 |
| AI agent / session | e.g. "Claude, frontend-dev-1 prompt" |
| Date | YYYY-MM-DD |
| Priority | `LOW` / `MEDIUM` / `HIGH` / `BLOCKER` |
| Frontend work blocked? | `YES` / `NO` |
| Related page/route | e.g. `/portal/reports` |
| Related existing endpoint | e.g. `GET /api/reports` (if any) |
| Agreed mock contract | `NONE` / exact JSON, only if backend agrees |

## Problem

What is missing or wrong from the user's point of view? Keep it short and
concrete.

## Why the frontend cannot solve it

Explain why this belongs in `server/` and not in the client.

## Proposed backend change

- **Method + path:** e.g. `PATCH /api/requests/:id/priority`
- **Request body/params:**
  ```json
  { "priority": "HIGH" }
  ```
- **Expected response:**
  ```json
  { "request": { "id": "...", "priority": "HIGH" } }
  ```
- **Permissions:** which roles and ownership rules?
- **Validation/errors:** expected 400/403/404 cases.
- **Database impact:** new field/model/enum? none?
- **Migration required:** `YES` / `NO`

## Acceptance criteria

- [ ] Frontend can call the endpoint as described.
- [ ] Response shape matches this ticket.
- [ ] Permission rules are documented.
- [ ] `docs/api.md` updated by the backend developer.
- [ ] Frontend types updated after `IMPLEMENTED`.

## Frontend workaround / temporary plan

Only allowed if the backend developer writes `AGREED MOCK` below. Otherwise:
"Frontend stays blocked on this part."

## Backend decision (only the backend developer writes this)

- **Decision:** `AGREED` / `REJECTED` / `NEEDS INFO`
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] `src/lib/types.ts` updated to the final shape.
- [ ] UI completed.
- [ ] Ticket status set to `FRONTEND CONSUMED`.
- [ ] Link moved under **Done** in the index.
