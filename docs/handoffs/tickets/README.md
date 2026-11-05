# Backend request tickets

This folder is the **only controlled channel** for frontend → backend change
requests. It does not give frontend agents permission to edit `server/`.

## Rules

1. One ticket = one backend change.
2. Copy `TEMPLATE.md` to `FE-YYYYMMDD-short-title.md`.
3. Fill every field. Empty fields cause questions and delay.
4. Link the ticket in `../frontend-to-backend.md`.
5. Tell the backend developer directly.
6. Do not edit `server/` while waiting.
7. Do not write the **Backend decision** section; only the backend developer does.
8. Wait for `IMPLEMENTED` before treating the contract as real.
9. After implementing the frontend side, set the ticket to `FRONTEND CONSUMED`.

## Naming

```text
FE-20261105-reports-filter.md
FE-20261105-ticket-priority.md
FE-20261105-quote-pdf.md
```

Use a short English slug. Do not reuse ticket numbers.

## Status values

| Status | Meaning |
| --- | --- |
| `PROPOSED` | Frontend created the ticket |
| `NEEDS INFO` | Backend needs more detail |
| `AGREED` | Backend accepted the shape; implementation pending |
| `AGREED MOCK` | Backend explicitly allows a temporary frontend mock |
| `IN PROGRESS` | Backend is implementing |
| `IMPLEMENTED` | Real endpoint available and documented |
| `REJECTED` | Backend will not implement; reason in ticket |
| `FRONTEND CONSUMED` | Frontend finished using the new contract |

## What not to put here

- Frontend-only UI tasks. Just do them in `client/`.
- Secrets, database passwords or `.env` content.
- Requests to "refactor the backend quickly". Tickets are for concrete,
  testable contract changes.
- Instructions for another AI agent to edit `server/`. That agent must refuse.
