# FE-20261119 — Upload public catalog and brand images

**Status:** `PROPOSED`

| Field | Value |
| --- | --- |
| Requester | Frontend team |
| AI agent / session | Codex dashboard and public site update |
| Date | 2026-11-19 |
| Priority | `HIGH` |
| Frontend work blocked? | `YES` for file uploads |
| Related page/route | `/admin/catalog` and proposed site settings page |
| Related existing endpoint | `POST /api/products`, `PATCH /api/products/:id` |
| Agreed mock contract | `NONE` |

## Problem

Product creation and editing accept an optional image URL. Admins need to select a local image, upload it, and save it on the product. The site settings editor also needs public logo and favicon URLs. The report attachment endpoint stores private reports and has a separate access model.

## Why the frontend cannot solve it

The catalog API stores a URL, while the backend needs to validate files, store them durably, and serve them to public visitors. The frontend can submit the returned URL through the existing product contract.

## Proposed backend change

- **Method + path:** `POST /api/admin/media/images`, followed by public reads of the returned same-origin URL.
- **Request body/params:** `multipart/form-data` with a single `file` and `purpose` set to `PRODUCT`, `LOGO`, or `FAVICON`.
- **Expected response:** HTTP 201 with `{ "imageUrl": "/api/media/images/<generated-id>.webp" }`. The URL is stable across restarts and fits the existing product image field.
- **Permissions:** Admin role and the existing CSRF protection for uploads. Public read access applies only to assets from this endpoint.
- **Validation/errors:** 400 for missing fields or invalid image contents, 401/403 for auth or CSRF failure, 413 for excess size, and 415 for unsupported types. Accept JPEG, PNG or WebP. Verify decoded image type and dimensions, re-encode to strip metadata, and generate storage names server-side. Serve with the correct content type. Keep previous URLs valid when a replacement upload or product save fails.
- **Database impact:** Durable public asset storage. A new record is optional if the backend needs lifecycle management.
- **Migration required:** `NO` for file storage alone. Confirm if the chosen storage design adds database records.

## Acceptance criteria

- [ ] An admin can upload a valid image before creating a product and replace one on an existing product using the returned URL.
- [ ] The URL renders on the public site through the existing same-origin image policy.
- [ ] Disallowed files and unauthorized requests are rejected. Report files retain their protected access.
- [ ] The backend documents the upload limits, response, and lifecycle in `docs/api.md`.

## Frontend workaround / temporary plan

The existing Image URL field can use an image already served by the site, for
example `/catalog/my-photo.webp` from `client/public/catalog/`. The public
catalog uses that URL ahead of the bundled examples. Uploading a file from the
dashboard still requires the endpoint. The current product contract accepts a
text URL of up to 500 characters.

## Backend decision (only the backend developer writes this)

- **Decision:**
- **Reason:**
- **Final endpoint/shape:**
- **Migration/seed notes:**
- **Implementation date:**
- **Implemented by:**

## Frontend follow-up

- [ ] Add a localized file picker, preview and upload errors to both product form modes.
- [ ] Retain the old image if an upload fails and refresh the public catalog after save.
- [ ] Verify the agreed endpoint and move the ticket to **Done**.
