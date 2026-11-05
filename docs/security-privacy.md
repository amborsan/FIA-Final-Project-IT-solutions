# Security and privacy

This document explains what the demo actually implements and what must be
reviewed before production. It is not a legal document.

---

## 1. Security controls

### Authentication

| Control | Implementation |
| --- | --- |
| Password hashing | Argon2 via `@node-rs/argon2` |
| Password policy | min. 10 chars, at least one letter and one number |
| Session storage | `Session` table stores only SHA-256 hash of the token |
| Session cookie | `orbit_session`, HTTP-only, SameSite=Lax, Secure in production |
| Session lifetime | 7 days |
| Password change | Signs out all other sessions |
| Generic login error | Same message for unknown email and wrong password |
| Rate limiting | 15 attempts / 15 min on auth endpoints |
| Account deletion | Password confirmation required |

### Request protection

| Control | Implementation |
| --- | --- |
| CSRF | Double-submit cookie + `X-CSRF-Token` header on state-changing requests |
| CORS | Allow-list via `CLIENT_ORIGIN`, credentials enabled |
| Security headers | Helmet + CSP (self only), frame-ancestors none |
| Body size | JSON/urlencoded limited to 1 MB |
| Input validation | Zod schemas for every mutation |
| SQL injection | Prisma parameterised queries |
| XSS (CMS) | `sanitize-html` allow-list before storage; React escapes other text |
| Upload abuse | MIME allow-list, 8 MB limit, random filename, no public URL |
| File access | Role/ownership check on every download |
| Rate limits | General API + stricter auth and public form limits |
| Errors | Central handler, no stack traces in responses |

### Authorisation matrix

| Resource | Customer | Technician | Admin |
| --- | --- | --- | --- |
| Own profile | read/write | read/write | read/write |
| Requests | own | assigned | all |
| Quotes | own | related to assigned request | all |
| Orders/invoices | own | – | all |
| Tickets | own | assigned | all |
| Internal ticket notes | invisible | read/write | read/write |
| Appointments | own (confirm/cancel) | assigned | all |
| Reports | own requests | own | all |
| Users | – | – | all |
| Catalog/CMS | public read | public read | CRUD |
| Contact inbox | – | – | all |

Ownership is checked in the handler **after** authentication, not only by hiding
buttons.

---

## 2. Data protection (GDPR)

### 2.1 Data map

| Data | Purpose | Legal basis | Stored in | Retention |
| --- | --- | --- | --- | --- |
| Email, name, phone, company, address | Account, contract communication | Art. 6(1)(b) | `users` | Until deletion + legal retention for invoices |
| Password hash | Login | Art. 6(1)(b), security | `users` | Until deletion |
| Session token hash, IP, user agent | Security, session management | Art. 6(1)(f) | `sessions` | 7 days |
| Quote request details | Prepare contract | Art. 6(1)(b), consent for leads | `service_requests` | Until project end + statutory periods |
| Quotes, orders, invoices | Contract execution, tax law | Art. 6(1)(b), Art. 6(1)(c) | `quotes`, `orders`, `invoices` | Invoices typically 10 years |
| Tickets, chat messages | Support | Art. 6(1)(b) | `tickets`, `messages` | ~3 years after last activity |
| Service reports and attachments | Documentation | Art. 6(1)(b) | `service_reports`, `storage/` | Project + warranty period |
| CMS author name | Publication | Art. 6(1)(f) | `content_pages` | Until content removed |
| Activity log | Security and traceability | Art. 6(1)(f) | `activity_logs` | 3–12 months recommended |
| Notifications | Service updates | Art. 6(1)(b) | `notifications` | 12 months recommended |
| Consent timestamps | Proof of consent | Art. 7(1) | various tables | As long as processing continues |
| Contact form | Answer enquiry | Consent / pre-contract | `contact_messages` | 6 months recommended |
| Guest chat token | Access to own guest chat | Consent | `conversations` | Delete after 90 days recommended |
| Language/cart/cookie choice | UX and security | § 25(2) TDDDG essential | Browser localStorage | Until user deletes |

### 2.2 Data subject rights

Implemented:

- **Access/portability:** `GET /api/privacy/export` (JSON download in portal).
- **Erasure:** `DELETE /api/privacy/account` (password required). Anonymises
  name, email, phone, address and password; deletes sessions. Invoices and
  financial records are kept as required by law.
- **Rectification:** profile edit.
- **Withdrawal of consent:** delete account or contact privacy@; no optional
  tracking exists to switch off.
- **Objection/restriction:** contact privacy@ (manual process for the MVP).

Not automated: restriction of processing, legal hold exceptions and full audit of
requests. A production system should log these requests and have a response
process within one month (Art. 12(3) GDPR).

### 2.3 Processors and transfers

The demo does not connect to external processors. A real deployment must list:

- hosting provider,
- email provider,
- backup provider,
- payment provider (if added),
- support/chat tools (if added).

Conclude Art. 28 GDPR data processing agreements. For transfers outside the EEA,
use an adequacy decision or Standard Contractual Clauses.

### 2.4 Technical and organisational measures (TOMs)

- TLS in production (reverse proxy).
- Role-based access and least privilege.
- Hashed passwords, hashed session tokens.
- Backups (not implemented in the demo; required for production).
- Logging without sensitive payloads (server currently logs errors only).
- Regular dependency updates and `npm audit`.
- Separate development and production databases.
- No production data in seeds or screenshots.

---

## 3. Cookies and consent

Only essential cookies are used:

| Name | Type | Purpose |
| --- | --- | --- |
| `orbit_session` | HTTP-only cookie | Login session |
| `orbit_csrf` | readable cookie | CSRF protection |
| `orbit_language` | localStorage | Language preference |
| `orbit_cart` | localStorage | Cart before checkout |
| `orbit_cookie_consent` | localStorage | Consent record and date |
| `orbit_guest_chat` | localStorage | Guest chat token |

No analytics, advertising, social plugins or third-party fonts are loaded. The
banner therefore offers **Accept** and **Essential only** with the same technical
result; this is honest and avoids dark patterns.

---

## 4. German/EU legal implementation

| Requirement | Where |
| --- | --- |
| Impressum (§ 5 DDG) | `/legal/imprint` |
| Privacy policy (Art. 13/14 GDPR) | `/legal/privacy` |
| Terms/AGB | `/legal/terms` |
| Consumer withdrawal information + model form | `/legal/withdrawal` |
| Cookie policy | `/legal/cookies` |
| Cookie settings / withdrawal of consent | footer + legal pages |
| Consent checkboxes on register, quote, contact, chat, checkout | forms |
| Consent timestamps | `acceptedTermsAt`, `acceptedPrivacyAt`, `consentAt`, `termsAcceptedAt` |
| Data export/deletion | portal → Profile & privacy |
| Accessibility basics | semantic HTML, labels, focus styles, contrast |

### What is still needed before a real launch

See [legal-checklist-de.md](legal-checklist-de.md). In short:

- Replace the fictional company data, register number, VAT ID, address, phone
  and email.
- Have AGB, privacy, withdrawal and cookie texts reviewed by a lawyer.
- Add a real data processing agreement with the host.
- Add a record of processing activities (Art. 30 GDPR).
- Appoint a data protection officer if required.
- Verify VAT rules for products/services and invoice requirements.
- Add an accessibility statement and test against WCAG 2.2 AA / BFSG if selling
  to consumers in the EU.
- Set up an incident response and 72-hour breach process.
- Verify the newsletter/marketing rules — there is no newsletter in this demo.

---

## 5. Threat model (MVP)

| Threat | Mitigation |
| --- | --- |
| Credential stuffing | Rate limit, Argon2, generic errors |
| Session theft | HTTP-only cookie, Secure in prod, short lifetime |
| CSRF | Double-submit token on every mutation |
| XSS through CMS | Server-side sanitising + React escaping |
| SQL injection | Prisma parameterisation |
| IDOR (view another customer's data) | Ownership checks in handlers |
| Malicious upload | Type/size limits, random names, auth download |
| Spam forms | Rate limits |
| Password reset abuse | No email reset in MVP; contact admin. Add a signed token flow later |
| Enumeration | Generic login error; limited public data |
| Brute force on guest chat | Token + rate limit |
| Data leak in logs | Do not log bodies/tokens; review before production |

### Known limitations of the demo

- No email verification, password reset or 2FA.
- No antivirus scanning of uploads.
- No account lockout after repeated failures (rate limit only).
- Chat polling, not real-time.
- No automated backup job.
- Admin can see all chats, which is disclosed in the privacy policy and should be
  limited to support staff in a real company.
- Session cleanup of expired rows is not scheduled; add a cron job in production.

---

## 6. Incident response (recommended)

1. Contain: revoke sessions, disable affected accounts, rotate secrets.
2. Assess: what data, which users, what risk.
3. Document: timeline, scope, actions.
4. Notify the supervisory authority within 72 hours if required (Art. 33 GDPR).
5. Notify affected users if high risk (Art. 34 GDPR).
6. Improve controls and update this document.
