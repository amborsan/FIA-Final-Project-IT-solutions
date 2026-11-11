# Frontend → Backend index

**The backend developer is the only person allowed to edit `server/`.**
Frontend agents must never implement a backend change themselves.

This file is the **index** of backend requests. The actual requests are separate
ticket files so two frontend developers do not overwrite each other.

- Ticket folder: [`tickets/`](tickets/)
- Template: [`tickets/TEMPLATE.md`](tickets/TEMPLATE.md)
- Rules: [`tickets/README.md`](tickets/README.md)
- Full frontend agent contract: [`../../client/Agent.md`](../../client/Agent.md)

## For frontend agents

If a task needs a new endpoint/field/permission/validation/database change:

1. Do **not** edit `server/`.
2. Create `tickets/FE-YYYYMMDD-short-title.md` from the template.
3. Add it to the **Open tickets** table below.
4. Tell the backend developer directly.
5. Continue only with frontend parts that do not depend on the missing contract.
6. Wait for `IMPLEMENTED` before updating `client/src/lib/types.ts`.

## Open tickets

| Ticket | Page / area | Need | Priority | Status |
| --- | --- | --- | --- | --- |
| [FE-20261110-demo-customer-login.md](tickets/FE-20261110-demo-customer-login.md) | `/login` | Confirm demo customer credentials; fresh login returns 401 | `MEDIUM` | `PROPOSED` |
| [FE-20261106-archived-users.md](tickets/FE-20261106-archived-users.md) | `/admin/users` | Return deactivated users plus `active`/`deactivatedAt` so the users list can have an archive tab | `MEDIUM` | `PROPOSED` |

## Done / frontend consumed

| Ticket | Final endpoint | Implemented | Frontend consumed |
| --- | --- | --- | --- |
| _None yet_ | | | |

## Backend announcements

Contract changes are announced by the backend developer in
[`backend-to-frontend.md`](backend-to-frontend.md). Frontend agents may read it
but must not edit it.
