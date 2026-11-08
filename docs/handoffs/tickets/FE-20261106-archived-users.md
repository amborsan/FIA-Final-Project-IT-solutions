# FE-20261106 — Archived users in admin user list

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend Developer 2 |
| AI agent / session | OpenCode — dashboard filters/search/pagination/archive task |
| Date | 2026-11-06 |
| Priority | `MEDIUM` |
| Frontend work blocked? | `NO` (only the users archive tab is blocked) |
| Related page/route | `/admin/users` |
| Related existing endpoint | `GET /api/admin/users?role=&q=` |
| Agreed mock contract | `NONE` |

## Problem

Admins can deactivate a user from the team area, but there is no way to see
deactivated (archived) accounts again. The users page now has search, role
filter and pagination, but no archive view because the API excludes those rows
and the response has no active/archived flag.

## Why the frontend cannot solve it

`GET /api/admin/users` filters with `deletedAt: null` inside `server/`, so the
records never reach the browser. The client cannot invent an archive view from
data it does not receive.

## Proposed backend change

- **Method + path:** `GET /api/admin/users?archived=true` (extend the existing endpoint)
- **Request params:**
  ```text
  role=CUSTOMER|TECHNICIAN|ADMIN   (optional, existing)
  q=search text                     (optional, existing)
  archived=true                     (optional; when true return only deactivated users)
  ```
  Omitted or `archived=false` keeps the current behaviour: active users only.
- **Expected response:**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "Sofia Reed",
        "role": "CUSTOMER",
        "phone": "+49 …",
        "companyName": "Example GmbH",
        "address": "Berlin",
        "preferredLanguage": "EN",
        "active": false,
        "deactivatedAt": "2026-11-06T10:00:00.000Z",
        "createdAt": "2026-01-10T09:00:00.000Z"
      }
    ]
  }
  ```
  `active` and `deactivatedAt` are the only new fields. Existing fields keep
  their current names and types.
- **Permissions:** `ADMIN` only (same as the current endpoint).
- **Validation/errors:** `403` for non-admins; an unknown `archived` value may be
  treated as `false`. `q` and `role` keep their current rules.
- **Database impact:** none — `User.deletedAt` already exists.
- **Migration required:** `NO`

## Acceptance criteria

- [ ] `GET /api/admin/users?archived=true` returns only users with `deletedAt != null`.
- [ ] The normal call still returns only active users.
- [ ] Every user in the response includes `active` and `deactivatedAt`.
- [ ] `role` and `q` filters work together with `archived=true`.
- [ ] `docs/api.md` updated by the backend developer.
- [ ] Frontend types updated after `IMPLEMENTED`.

## Frontend workaround / temporary plan

None. The rest of the users page (search, role filter, pagination) is already
complete using the current contract. Only the archive tab waits for this
ticket.

## Backend decision (only the backend developer writes this)

- **Decision:** `AGREED` / `REJECTED` / `NEEDS INFO`
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] `src/lib/types.ts` updated to the final shape.
- [ ] Archive tab enabled on `/admin/users`.
- [ ] Ticket status set to `FRONTEND CONSUMED`.
- [ ] Link moved under **Done** in the index.
