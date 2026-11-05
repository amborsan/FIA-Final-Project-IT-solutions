# Testing and QA

## 1. Automated tests

Run:

```bash
cd server
npm test
```

Current coverage (21 tests):

### Unit tests — `test/helpers.test.ts`

- money rounding (`round2`)
- reference format/uniqueness (`createReference`)
- future dates (`daysFromNow`)
- totals with 19 % and 7 % VAT
- HTML sanitising (scripts, event handlers, `javascript:` links)
- excerpt generation

### Validation tests — `test/validation.test.ts`

- valid/invalid registration
- weak password rejection
- required legal consent
- minimum request description
- default ticket priority
- quote must have items

### API tests — `test/api.test.ts`

- health endpoint
- CSRF rejection without token
- admin login, `/auth/me`, admin stats
- customer gets 403 on admin routes, sees only own requests
- generic 401 for wrong password
- public catalog access

These tests use the development database but only read data and create
short-lived sessions. For CI, create a dedicated test database and set
`DATABASE_URL` accordingly.

### Type checking / builds

```bash
cd server && npm run build
cd client && npm run build
```

The client build runs TypeScript first and then Vite.

---

## 2. Manual QA checklist

### Public website

- [ ] Home loads in EN and DE; language switch persists after reload.
- [ ] All 10 services render with names/descriptions in both languages.
- [ ] Service detail opens and "Request this service" preselects the service.
- [ ] Product search, category filter and product detail work.
- [ ] Add to cart, change quantity, remove item, cart badge updates.
- [ ] Checkout requires login; order creates invoice for logged-in customer.
- [ ] Quote form requires privacy checkbox and shows reference.
- [ ] Contact form requires privacy checkbox and shows success.
- [ ] Guest chat starts, shows the thread and accepts a reply.
- [ ] Legal pages load in both languages from every footer.
- [ ] Cookie settings reopen from footer/legal page.
- [ ] Mobile menu works at 360 px.

### Auth

- [ ] Register rejects mismatched passwords and short passwords.
- [ ] Register requires terms + privacy.
- [ ] Login with each demo account redirects to the right dashboard.
- [ ] Logout clears the session.
- [ ] Visiting a protected page while logged out redirects to login.
- [ ] Customer cannot open `/admin` or `/technician`.

### Customer portal

- [ ] Dashboard counts match data.
- [ ] Request list and detail show quotes, reports, appointments.
- [ ] Accept quote creates order + invoice and updates status.
- [ ] Reject quote updates status.
- [ ] Cancel request only offered in allowed statuses.
- [ ] Ticket creation and reply work.
- [ ] Appointment confirm/cancel works.
- [ ] Report download works (if a file exists).
- [ ] Profile update persists; language preference can be changed.
- [ ] Password change works and signs out other sessions.
- [ ] Data export downloads JSON.
- [ ] Delete account requires `DELETE` + password and anonymises data.

### Technician

- [ ] Assigned requests are visible; unassigned ones are not.
- [ ] Status update works.
- [ ] Ticket status update and internal notes work.
- [ ] Appointments visible and status can be changed.
- [ ] Service report with PDF/image upload works.
- [ ] Unsupported file type shows an error.
- [ ] Report appears for the customer and admin.

### Admin

- [ ] KPI cards show sensible values.
- [ ] Request detail: link lead to customer, assign technician, change status.
- [ ] Quote builder: multiple items, totals correct, send quote.
- [ ] Orders: status update, invoice mark paid.
- [ ] Tickets: assign, status, internal note, reply.
- [ ] Catalog: create/edit/archive service and product.
- [ ] CMS: create page in EN+DE, rich text formatting, publish; visible on blog.
- [ ] Draft page not visible publicly.
- [ ] Users: create each role, change role, deactivate.
- [ ] Contact inbox: mark read/replied.
- [ ] Chat: reply to guest/customer, start direct staff chat, close.
- [ ] Activity log populates.

### Security spot checks

- [ ] `POST /api/auth/login` without CSRF returns 403.
- [ ] Customer request ID from another customer returns 403/404.
- [ ] Customer sees no internal ticket notes in API response.
- [ ] Uploaded file URL is not directly reachable without auth.
- [ ] HTML with `<script>` is sanitised in a CMS page.
- [ ] Login rate limit triggers after repeated attempts.
- [ ] Session cookie is HTTP-only.
- [ ] Password hash never appears in any response.

---

## 3. Browser/performance checks

Lighthouse result for the home page after the final build:

| Category | Score |
| --- | --- |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

- Lighthouse (Chrome DevTools) on `/` and `/portal`.
- Test 360 px, 768 px, 1024 px and 1440 px widths.
- Check console for errors on every route.
- Check network tab for failed requests.
- Run with a throttled connection; verify loading states.
- Toggle reduced motion in the OS; animations are subtle and optional.

---

## 4. Demo data reset

To recreate demo transactions:

1. Back up anything you need.
2. Use a **development** database only.
3. Drop/recreate the database or delete the sample rows, then:

```bash
cd server
npx prisma migrate reset   # destructive, asks for confirmation
npm run db:seed
```

Alternatively, create a new database and update `DATABASE_URL`.

---

## 5. Known test gaps

- No E2E browser test suite (Playwright) yet.
- No coverage report.
- No visual regression tests.
- No load/penetration test.
- Email, payment and backup flows are out of scope.

Recommended next step for the team: add Playwright for the three critical
journeys (visitor quote → admin quote → customer accept, login/roles, checkout).
