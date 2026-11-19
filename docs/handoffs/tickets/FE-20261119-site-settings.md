# FE-20261119 — Persist editable site information and branding

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend team |
| AI agent / session | Codex dashboard and public site update |
| Date | 2026-11-19 |
| Priority | `HIGH` |
| Frontend work blocked? | `YES` for the dashboard editor |
| Related page/route | Proposed `/admin/site-settings`, public header and footer |
| Related existing endpoint | CMS article endpoints manage published articles |
| Agreed mock contract | `NONE` |

## Problem

The website name, contact details, logo and favicon are currently bundled into the client. Admins need to update them from the dashboard and see the published values on the public site.

## Why the frontend cannot solve it

These are shared site values that must persist and be readable across browsers. Articles have a public content response and a different workflow. The editor needs an admin-only write operation and a public read of the current settings.

## Proposed backend change

- **Method + path:** public `GET /api/site-settings` and admin-only `PATCH /api/admin/site-settings`.
- **Request body/params:** PATCH any of `nameEn`, `nameDe`, `descriptionEn`, `descriptionDe`, `contactEmail`, `contactPhone`, `address`, `logoUrl`, and `faviconUrl`. Omitted fields keep their current values. Null image URLs restore the bundled defaults.
- **Expected response:** HTTP 200 with `{ "settings": { "nameEn": "...", "nameDe": "...", "descriptionEn": "...", "descriptionDe": "...", "contactEmail": "...", "contactPhone": "...", "address": "...", "logoUrl": null, "faviconUrl": null } }` for both reads and saves.
- **Permissions:** Public read. Admin write with existing CSRF protection. Expose only published contact and branding fields.
- **Validation/errors:** 400 for invalid values or an image URL outside the approved media path, 401/403 for auth or CSRF failure. Validate all fields before applying an update.
- **Database impact:** Persist one site settings record. Supply the current display defaults for existing installations. Image URLs use [the public media endpoint](FE-20261119-media-upload.md).
- **Migration required:** `YES` if implemented as a new singleton record.

## Acceptance criteria

- [ ] An authorized dashboard save persists through a restart and appears on a fresh public page load.
- [ ] The logo and site icon can be set independently or restored to the defaults.
- [ ] Existing settings remain intact if a replacement upload or save fails.
- [ ] The backend documents the read and write endpoints in `docs/api.md`.

## Frontend workaround / temporary plan

The public header and footer render the bundled SVG mark. The favicon is served
as a versioned static asset, and the public contact pages use shared defaults.
The dashboard editor still needs the backend contract. The running API returned
HTTP 404 for the proposed public settings read while its health check returned
HTTP 200 on November 19.

## Backend decision (only the backend developer writes this)

- **Decision:**
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] Add the bilingual dashboard form using the agreed settings contract.
- [ ] Read public settings in shared branding and update the favicon after save and reload.
- [ ] Verify the agreed endpoints and move the ticket to **Done**.
