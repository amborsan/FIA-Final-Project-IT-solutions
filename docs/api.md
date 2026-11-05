# API reference

Base URL: `/api` (development proxy: `http://localhost:3000/api`)

All responses are JSON unless a file is downloaded. Dates are ISO 8601 strings.
Money values are returned as decimal strings (e.g. `"1686.11"`).

## Conventions

### Authentication

The browser sends the HTTP-only `orbit_session` cookie automatically. The API
also works with that cookie from tools such as curl.

### CSRF

Every `POST`, `PATCH`, `PUT` and `DELETE` must include the header:

```http
X-CSRF-Token: <token from GET /api/auth/csrf or the orbit_csrf cookie>
```

First call:

```http
GET /api/auth/csrf
```

Response:

```json
{ "csrfToken": "8f2c…" }
```

### Errors

```json
{ "error": "Human-readable message." }
```

Validation errors include details:

```json
{
  "error": "Please check the form fields.",
  "details": {
    "fieldErrors": { "email": ["Please enter a valid email address."] }
  }
}
```

Common status codes: `400` validation, `401` not signed in, `403` wrong role /
CSRF, `404` not found, `409` duplicate, `429` rate limited, `500` server error.

### Roles

`PUBLIC` = no login · `CUSTOMER` · `TECHNICIAN` · `ADMIN`

---

## Auth

| Method | Path             | Access               | Description                                        |
| ------ | ---------------- | -------------------- | -------------------------------------------------- |
| GET    | `/auth/csrf`     | public               | Set CSRF cookie and return token                   |
| POST   | `/auth/register` | public               | Create customer account (terms + privacy required) |
| POST   | `/auth/login`    | public               | Email/password login, creates session              |
| POST   | `/auth/logout`   | public (with cookie) | Delete session                                     |
| GET    | `/auth/me`       | public               | Current user or `null`                             |

Register body:

```json
{
  "firstName": "Sofia",
  "lastName": "Reed",
  "email": "sofia@example.com",
  "password": "Password123",
  "phone": "+49 …",
  "companyName": "Example GmbH",
  "preferredLanguage": "EN",
  "acceptTerms": true,
  "acceptPrivacy": true
}
```

---

## Public website

| Method | Path             | Access | Description                                   |
| ------ | ---------------- | ------ | --------------------------------------------- |
| GET    | `/health`        | public | Service health                                |
| POST   | `/contact`       | public | Contact form (rate limited, consent required) |
| GET    | `/content`       | public | Published CMS articles                        |
| GET    | `/content/:slug` | public | Single article (draft only for admin)         |

Contact body: `name, email, phone?, subject, message, acceptPrivacy`.

---

## Services

| Method | Path              | Access | Description                                |
| ------ | ----------------- | ------ | ------------------------------------------ |
| GET    | `/services`       | public | Active services; admin can use `?all=true` |
| GET    | `/services/:slug` | public | Service by slug                            |
| POST   | `/services`       | admin  | Create service                             |
| PATCH  | `/services/:id`   | admin  | Update service                             |
| DELETE | `/services/:id`   | admin  | Archive (`active=false`)                   |

Service body: `slug, nameEn, nameDe, descriptionEn, descriptionDe, icon,
startingPrice?, active, sortOrder`.

---

## Categories and products

| Method | Path              | Access | Description                                                      |
| ------ | ----------------- | ------ | ---------------------------------------------------------------- |
| GET    | `/categories`     | public | Product categories                                               |
| POST   | `/categories`     | admin  | Create category                                                  |
| GET    | `/products`       | public | List; filters `q`, `category`, `featured=true`, admin `all=true` |
| GET    | `/products/:slug` | public | Product with category                                            |
| POST   | `/products`       | admin  | Create product                                                   |
| PATCH  | `/products/:id`   | admin  | Update product                                                   |
| DELETE | `/products/:id`   | admin  | Archive product                                                  |

Product body: `slug, sku, categoryId, nameEn, nameDe, descriptionEn,
descriptionDe, price, stock, imageUrl?, active, featured`.

---

## Service requests

| Method | Path                   | Access                       | Description                                       |
| ------ | ---------------------- | ---------------------------- | ------------------------------------------------- |
| POST   | `/requests/public`     | public                       | Quote request as visitor/customer (rate limited)  |
| POST   | `/requests`            | admin                        | Create request on behalf of a customer            |
| GET    | `/requests`            | auth                         | Customer: own · Technician: assigned · Admin: all |
| GET    | `/requests/:id`        | owner/assigned/admin         | Full detail with quotes, appointments, reports    |
| PATCH  | `/requests/:id/assign` | admin                        | Set/clear `technicianId` and/or `customerId`      |
| PATCH  | `/requests/:id/status` | admin or assigned technician | Change status                                     |
| POST   | `/requests/:id/cancel` | customer owner               | Cancel while `NEW`, `REVIEWING` or `QUOTED`       |

Public request body:

```json
{
  "contactName": "Sofia Reed",
  "contactEmail": "sofia@example.com",
  "contactPhone": "+49 …",
  "title": "New office network",
  "description": "We need Wi-Fi and cabling for 12 desks…",
  "serviceId": "uuid-or-empty",
  "siteAddress": "Berlin",
  "preferredDate": "2026-12-01",
  "budget": 4500,
  "acceptPrivacy": true
}
```

Status values: `NEW`, `REVIEWING`, `QUOTED`, `APPROVED`, `SCHEDULED`,
`IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

---

## Quotes

| Method | Path                 | Access               | Description                                           |
| ------ | -------------------- | -------------------- | ----------------------------------------------------- |
| GET    | `/quotes`            | auth                 | Customer: own · Technician: own requests · Admin: all |
| GET    | `/quotes/:id`        | owner/assigned/admin | Quote with items                                      |
| POST   | `/quotes`            | admin                | Create draft quote (request must have a customer)     |
| POST   | `/quotes/:id/send`   | admin                | Draft → sent + notification                           |
| POST   | `/quotes/:id/accept` | customer owner       | Creates order + invoice, updates stock                |
| POST   | `/quotes/:id/reject` | customer owner       | Reject sent quote                                     |

Create body:

```json
{
  "requestId": "uuid",
  "validUntil": "2026-12-15T00:00:00.000Z",
  "taxRate": 19,
  "notes": "Installation included.",
  "items": [{ "description": "Access point", "quantity": 3, "unitPrice": 189 }]
}
```

Totals are calculated on the server. Do not send subtotal/total.

---

## Orders and invoices

| Method | Path                 | Access      | Description                  |
| ------ | -------------------- | ----------- | ---------------------------- |
| POST   | `/orders`            | customer    | Product order from the cart  |
| GET    | `/orders`            | auth        | Customer own · Admin all     |
| GET    | `/orders/:id`        | owner/admin | Order with items and invoice |
| PATCH  | `/orders/:id/status` | admin       | Update order status          |
| GET    | `/invoices`          | auth        | Customer own · Admin all     |
| PATCH  | `/invoices/:id/pay`  | admin       | Mark invoice paid            |

Order body:

```json
{
  "items": [{ "productId": "uuid", "quantity": 2 }],
  "shippingAddress": "Lindenweg 8, 10115 Berlin",
  "notes": "Please call before delivery.",
  "acceptTerms": true
}
```

---

## Tickets

| Method | Path                    | Access                    | Description                                     |
| ------ | ----------------------- | ------------------------- | ----------------------------------------------- |
| POST   | `/tickets`              | customer/admin            | Create ticket                                   |
| GET    | `/tickets`              | auth                      | Customer own · Technician assigned · Admin all  |
| GET    | `/tickets/:id`          | owner/assigned/admin      | Messages (internal notes hidden from customers) |
| POST   | `/tickets/:id/messages` | owner/assigned/admin      | Reply; staff can set `isInternal`               |
| PATCH  | `/tickets/:id/status`   | admin/assigned technician | Change status                                   |
| PATCH  | `/tickets/:id/assign`   | admin                     | Set technician                                  |

Create body: `subject, description, priority, category?, requestId?`.
Message body: `body, isInternal?`.

---

## Appointments

| Method | Path                       | Access               | Description                                    |
| ------ | -------------------------- | -------------------- | ---------------------------------------------- |
| GET    | `/appointments`            | auth                 | Customer own · Technician assigned · Admin all |
| POST   | `/appointments`            | admin/technician     | Create appointment                             |
| PATCH  | `/appointments/:id/status` | owner/assigned/admin | Customers may only confirm/cancel              |

Body: `customerId, technicianId?, requestId?, title, notes?, startsAt, endsAt,
location?`.

---

## Service reports

| Method | Path                   | Access                 | Description                                        |
| ------ | ---------------------- | ---------------------- | -------------------------------------------------- |
| GET    | `/reports`             | auth                   | Customer own requests · Technician own · Admin all |
| POST   | `/reports`             | technician/admin       | `multipart/form-data` report + optional file       |
| PATCH  | `/reports/:id/approve` | admin                  | Approve report                                     |
| GET    | `/reports/:id/file`    | owner/technician/admin | Protected attachment download                      |

Multipart fields: `requestId?`, `ticketId?`, `title`, `workDone`, `hours`,
`materials?`, `file?` (PDF/PNG/JPG, max 8 MB).

---

## Chat

### Guest

| Method | Path                       | Access | Description                                          |
| ------ | -------------------------- | ------ | ---------------------------------------------------- |
| POST   | `/chat/guest`              | public | Start guest chat, returns `conversationId` + `token` |
| GET    | `/chat/guest/:id?token=…`  | token  | Read messages                                        |
| POST   | `/chat/guest/:id/messages` | token  | Reply                                                |

Guest start body: `name, email, subject, message, acceptPrivacy`.
Guest reply body: `token, body`.

### Authenticated

| Method | Path                               | Access                  | Description                |
| ------ | ---------------------------------- | ----------------------- | -------------------------- |
| GET    | `/chat/conversations`              | auth                    | List visible conversations |
| POST   | `/chat/conversations`              | auth                    | Start support/direct chat  |
| GET    | `/chat/conversations/:id`          | participant/owner/admin | Thread                     |
| POST   | `/chat/conversations/:id/messages` | participant/owner/admin | Send message               |
| PATCH  | `/chat/conversations/:id/close`    | admin                   | Close conversation         |

Start body: `type ("SUPPORT" | "DIRECT"), subject, message, participantIds?`.
Customers may only start `SUPPORT`; staff can start `DIRECT` chats.

---

## Profile, notifications and privacy

| Method | Path                      | Access              | Description                                      |
| ------ | ------------------------- | ------------------- | ------------------------------------------------ |
| GET    | `/profile`                | auth                | User + request/ticket/order counts               |
| PATCH  | `/profile`                | auth                | Update name, phone, company, address, language   |
| POST   | `/profile/password`       | auth                | Change password (signs out other sessions)       |
| GET    | `/notifications`          | auth                | Last 50 notifications                            |
| PATCH  | `/notifications/read-all` | auth                | Mark all read                                    |
| PATCH  | `/notifications/:id/read` | auth                | Mark one read                                    |
| GET    | `/profile/activity`       | auth                | Own activity log                                 |
| GET    | `/privacy/export`         | auth                | Download all personal data as JSON               |
| DELETE | `/privacy/account`        | customer/technician | Delete + anonymise account (`password` required) |

Admins cannot delete their account through this endpoint; another admin must
deactivate it in the team area.

---

## Admin

All routes require `ADMIN`.

| Method | Path                    | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| GET    | `/admin/stats`          | KPIs + recent requests/tickets/activity   |
| GET    | `/admin/users?role=&q=` | List users                                |
| POST   | `/admin/users`          | Create user with role                     |
| PATCH  | `/admin/users/:id`      | Change role/contact details or reactivate |
| DELETE | `/admin/users/:id`      | Soft-deactivate                           |
| GET    | `/admin/content`        | All CMS pages including drafts            |
| POST   | `/admin/content`        | Create page (HTML sanitised)              |
| PATCH  | `/admin/content/:id`    | Update page                               |
| DELETE | `/admin/content/:id`    | Delete page                               |
| GET    | `/admin/contacts`       | Contact inbox                             |
| PATCH  | `/admin/contacts/:id`   | Set `NEW`, `READ` or `REPLIED`            |
| GET    | `/admin/activity`       | Last 100 activity entries                 |

Admin user create body: `firstName, lastName, email, password, role, phone?,
companyName?, address?`.

CMS body: `slug, titleEn, titleDe, excerptEn?, excerptDe?, bodyEn, bodyDe,
status ("DRAFT" | "PUBLISHED")`.

---

## Quick curl example

```bash
# 1. get token + cookie
curl -s -c cookies.txt http://localhost:3000/api/auth/csrf

# 2. login (replace TOKEN)
curl -s -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: TOKEN" \
  -d '{"email":"customer@fia-it.de","password":"Customer12345!"}' \
  http://localhost:3000/api/auth/login

# 3. read own requests
curl -s -b cookies.txt http://localhost:3000/api/requests
```
