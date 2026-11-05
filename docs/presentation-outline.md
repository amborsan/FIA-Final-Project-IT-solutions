# Presentation outline (approx. 15 minutes)

> Suggested split between three team members. Adjust names and timing to your
> presentation rules.

| # | Slide | Speaker | Time | Notes |
| --- | --- | --- | --- | --- |
| 1 | Title + team | All | 20 s | Orbit IT Solutions — IT service platform. Names, course, date. |
| 2 | The problem | Frontend 1 | 60 s | Small IT firms run on email, WhatsApp and spreadsheets. Customers do not know the status; quotes get lost. |
| 3 | Our solution | Frontend 1 | 45 s | Public site + customer portal + staff dashboards in one platform. |
| 4 | Users and roles | Frontend 1 | 60 s | Visitor, customer, technician, admin. Show the role diagram. |
| 5 | MVP scope | Backend | 60 s | What is in: requests, quotes, orders, tickets, chat, CMS, legal. What is out: payments, email, real-time. |
| 6 | Architecture | Backend | 90 s | React → Express → PostgreSQL. Same origin in production. Show the diagram. |
| 7 | Data model / ERD | Backend | 90 s | User → request → quote → order → invoice; tickets; chat; CMS. Explain one-to-many and one-to-one. |
| 8 | End-to-end flow | Frontend 2 | 60 s | Quote request → admin links customer + creates quote → customer accepts → order + invoice. |
| 9 | Security | Backend | 75 s | Argon2, server sessions, CSRF, roles, validation, sanitising, uploads, rate limits. |
| 10 | Privacy & legal | Frontend 2 | 75 s | Impressum, privacy, AGB, withdrawal, cookies; consent timestamps; data export/delete; demo disclaimer. |
| 11 | Bilingual UX | Frontend 1 | 45 s | EN primary, DE secondary; every label and API content translated. Show switch. |
| 12 | Live demo | All | 4–5 min | Follow `docs/demo-script.md`. Keep it short; do not type long forms live. |
| 13 | Testing & quality | Backend | 45 s | 21 automated tests, type checks, manual QA, security spot checks. |
| 14 | Lessons & next steps | All | 45 s | Junior team scope, what we learned, next: E2E tests, email, payments, WebSockets, accessibility audit. |
| 15 | Questions | All | 2 min | Have the ERD and API docs ready on a second screen. |

---

## Slide content hints

### 2. The problem

Use four pain points with icons:

- “Where is my quote?”
- “Which technician is coming?”
- “Which invoice is still open?”
- “Is our website even GDPR-compliant?”

### 4. Roles

Show the Mermaid diagram from `docs/project-description.md` as an image. Add one
sentence per role.

### 6. Architecture

Show the diagram from `docs/architecture.md`. Emphasise:

- one origin in production → simple cookies,
- PostgreSQL as the single source of truth,
- protected file storage,
- polling for chat instead of WebSockets (scope decision).

### 7. ERD

Show a simplified version:

```text
User ──< ServiceRequest ──< Quote ──< QuoteItem
                         └── Order ── Invoice
User ──< Ticket ──< TicketMessage
User ──< Conversation ──< Message
```

Then mention the full ERD is in the docs.

### 9. Security

Use the “layers” visual:

1. Validate (Zod)
2. Authenticate (session)
3. Authorise (role + ownership)
4. Sanitise (HTML, uploads)
5. Limit (rate limits)
6. Protect (Helmet, CSRF, cookies)

### 10. Privacy

Do not claim legal advice. Say clearly: “We implemented the technical basis and
templates; a lawyer must review the final texts.” That is a strength, not a
weakness.

### 14. Lessons

Honest points:

- Scope control matters.
- API contracts and role rules are the hard part.
- Bilingual content doubles the work but is worth it.
- Security and privacy must be built in, not added at the end.

---

## Presentation checklist

- [ ] Slides exported as PDF as a backup.
- [ ] Demo database seeded and tested 30 minutes before.
- [ ] Three demo accounts logged out/in separately.
- [ ] Browser zoom 100 %, notifications off.
- [ ] No real personal data in the demo.
- [ ] ERD/API docs open in a second tab for questions.
- [ ] Timer visible.
- [ ] One person drives, one narrates, one handles questions.
