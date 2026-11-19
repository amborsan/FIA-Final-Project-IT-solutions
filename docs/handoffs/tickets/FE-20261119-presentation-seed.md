# FE-20261119-presentation-seed — Shared presentation seed

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend team |
| AI agent / session | Codex, presentation preparation |
| Date | 2026-11-19 |
| Priority | `HIGH` |
| Frontend work blocked? | `YES` for rehearsing with the named accounts and the final seeded data |
| Related page/route | `/login`, `/admin`, public services and products |
| Related existing endpoint | Existing login and public catalog endpoints |
| Agreed mock contract | `NONE` |

## Problem

Each teammate needs the same fictional demo catalog, images, and sample workflow data after cloning and seeding an empty local database. The current seed creates a generic admin account. It does not create an individual admin account for each presenter, and the current product photos come from the frontend’s fallbacks.

## Why the frontend cannot solve it

The backend seed creates users, hashes passwords, grants roles, and inserts persisted records. Local dashboard edits and files on a teammate’s machine do not travel with the Git revision.

## Proposed backend change

- **Method, path, request and response** — Keep the existing API. Update the demo seed and retain the existing generic admin and demo workflow records.
- **Accounts** — Add three distinct `ADMIN` fixtures with stable IDs. The proposed email addresses use the existing fictional demo domain. On a fresh seed, use Otto Mueller as the generic demo administrator’s display name, keeping its existing ID and login address.

  | Name | Demo email |
  | --- | --- |
  | I-Chieh Liu | `ichiehliu@fia-it.de` |
  | Feras Hifean | `ferashifean@fia-it.de` |
  | Ali Borsan | `aliborsan@fia-it.de` |

- **Permissions** — Seed admin roles through the existing trusted seed path. Share demo-only credentials through the team’s local setup process.
- **Validation and reruns** — Preserve existing fixture identities and avoid duplicates. Treat an email collision with an unrelated account as an error rather than elevating that account.
- **Catalog data** — Reproduce the agreed demo catalog and workflow from a fresh database. Keep existing service slugs and bilingual fields so the checked-in service examples and photos continue to match. For the currently available product-specific photos, use the existing `imageUrl` field with the paths below, subject to any replacements the team approves. Other products can continue to use the frontend’s category images.

  | Product slug | Public image URL |
  | --- | --- |
  | `lenovo-thinkpad-e14` | `/catalog/thinkpad-e14.webp` |
  | `dell-optiplex-7010` | `/catalog/dell-desktop.webp` |
  | `fritzbox-7590-ax` | `/catalog/wifi-router.webp` |
  | `unifi-6-pro` | `/catalog/unifi-access-point.webp` |
  | `apc-ups-1500` | `/catalog/battery-backup.webp` |
  | `hp-laserjet-pro` | `/catalog/laser-printer.webp` |

- **Database impact** — Data fixtures only. The `ADMIN` role and product `imageUrl` already exist.
- **Migration required** — `NO`.

## Acceptance criteria

- [ ] A fresh clone and empty demo database produce the agreed catalog and sample workflow.
- [ ] All three named users sign in through the existing login and can open the admin dashboard.
- [ ] The generic demo admin, technician, and customer logins still work. The generic admin displays as Otto Mueller on a fresh seed.
- [ ] Each seeded image path resolves to a committed public asset. Website and service images load from the same revision.
- [ ] Re-running the seed avoids duplicate users and leaves existing account passwords intact.

## Frontend workaround / temporary plan

Frontend stays blocked on the named seed accounts and any seed-backed image URLs.

## Backend decision (only the backend developer writes this)

- **Decision** —
- **Reason** —
- **Final endpoint/shape** —
- **Migration/seed notes** —
- **Implementation date** —
- **Implemented by** —

## Frontend follow-up

- [ ] Verify all named logins and catalog images on a fresh seed.
- [ ] Update the team setup guide with confirmed login details.
- [ ] Mark the ticket `FRONTEND CONSUMED` and move its link under Done.
