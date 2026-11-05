# Orbit IT Solutions — Full-Stack Platform

A complete demo platform for a small IT services company. Customers can request
quotes, order equipment, track projects, open support tickets and chat with the
team. Technicians manage assigned work and reports. Admins manage the catalog,
quotes, orders, content and users.

> **Graduation project / demo:** all people, prices, company details and legal
> texts are fictional. The legal pages are templates, not legal advice.

---

## 1. What is included

| Area | Features |
| --- | --- |
| Public website | Home, 10 services, product shop, product details, about, insights/blog, contact, quote request |
| Customer portal | Dashboard, requests, quotes (accept/reject), orders and invoices, tickets, appointments, service reports, chat, profile/privacy tools |
| Technician area | Assigned requests, status updates, assigned tickets, appointments, service reports with file upload |
| Admin area | Dashboard/KPIs, requests + quote builder + assignment, orders/invoices, tickets, catalog (services/products), CMS with rich editor, users/roles, chat, contact inbox, activity log |
| Chat | Public guest chat widget, customer support chat, private staff chats |
| Legal & privacy | Impressum, Privacy policy (GDPR), Terms (AGB), Withdrawal information, Cookie policy, cookie settings, consent timestamps, data export, account deletion |
| Languages | English (primary) and German (secondary), switchable in the header and persisted in the browser |
| Security | Argon2 passwords, server sessions, HTTP-only cookies, CSRF double-submit, role checks, rate limits, Zod validation, HTML sanitising, Helmet, upload allow-list |

---

## 2. Tech stack

- **Frontend:** React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS 4, DaisyUI 5, Lucide icons
- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL
- **Auth:** server-side sessions + Argon2 + CSRF token
- **Tests:** Node.js built-in test runner (`node --test`)
- **Tooling:** Vite 8, npm

The simplified target stack from the roadmap (React/TypeScript/Tailwind/DaisyUI,
Node/Express, PostgreSQL/Prisma) is used as-is.

---

## 3. Quick start

### Prerequisites

- Node.js 22 or newer (tested on Node 24)
- PostgreSQL 16 or newer (tested on PostgreSQL 18)
- npm

### 1. Create the database

```bash
createdb orbit_platform
# or: psql -U postgres -c "CREATE DATABASE orbit_platform;"
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
# edit DATABASE_URL if your PostgreSQL user/password differ
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

`npm run db:seed` is safe to run again. It creates the demo accounts, services,
products and sample workflows only when the database is empty.

### 3. Start the API

```bash
cd server
npm run dev
# API: http://localhost:3000
```

### 4. Start the frontend (development)

```bash
cd client
npm install
npm run dev
# App: http://localhost:5173
```

Vite proxies `/api` to `http://localhost:3000`. Open the app, accept the cookie
notice and log in with a demo account.

### 5. Production-style build

```bash
cd client
npm run build

cd ../server
npm run build       # type check
npm start           # Express serves ../client/dist as well as /api
```

Then open `http://localhost:3000`.

---

## 4. Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@orbit-it.de` | `Admin12345!` |
| Technician | `tech@orbit-it.de` | `Tech12345!` |
| Technician 2 | `tech2@orbit-it.de` | `Tech12345!` |
| Customer (individual) | `customer@orbit-it.de` | `Customer12345!` |
| Customer (business) | `business@orbit-it.de` | `Customer12345!` |

Demo cards on the login page fill these in automatically.

---

## 5. Project structure

```text
.
├── client/                  React application (frontend team)
│   ├── src/routes/          File-based TanStack Router pages
│   ├── src/components/      Shared UI components
│   ├── src/context/         Auth and cart state
│   ├── src/i18n/            English/German translations
│   ├── src/lib/             API client and TypeScript types
│   └── AGENTS.md            Rules for frontend AI agents
├── server/                  Express + Prisma API (backend team)
│   ├── prisma/              Schema, migrations, seed data
│   ├── src/routes/          API route modules
│   ├── src/middleware/      Auth, CSRF, rate limits, errors
│   ├── src/auth/            Password and session helpers
│   ├── test/                Automated tests
│   └── AGENTS.md            Rules for backend AI agents
├── docs/                    Architecture, ERD, API, legal, presentation docs
├── agents/                  Copy-ready agent role descriptions
└── README.md
```

A separate, empty starter frontend lives **outside this project** at:

```text
../frontend-starter
```

See [docs/frontend-starter.md](docs/frontend-starter.md).

---

## 6. Useful commands

### Server

| Command | Purpose |
| --- | --- |
| `npm run dev` | Generate Prisma client and start with watch mode |
| `npm start` | Start without watch mode |
| `npm run build` | Prisma generate + TypeScript type check |
| `npm test` | Unit + API tests |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio |

### Client

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

---

## 7. Documentation

| Document | Contents |
| --- | --- |
| [docs/project-description.md](docs/project-description.md) | Problem, goals, personas, scope, success criteria |
| [docs/architecture.md](docs/architecture.md) | System diagram, request flow, folder map |
| [docs/database-erd.md](docs/database-erd.md) | Mermaid ERD and data dictionary |
| [docs/api.md](docs/api.md) | Endpoint reference and permissions |
| [docs/security-privacy.md](docs/security-privacy.md) | Security controls, data map, GDPR rights |
| [docs/legal-checklist-de.md](docs/legal-checklist-de.md) | German/EU legal launch checklist |
| [docs/testing.md](docs/testing.md) | Test strategy and manual QA checklist |
| [docs/presentation-outline.md](docs/presentation-outline.md) | Slide-by-slide presentation plan |
| [docs/demo-script.md](docs/demo-script.md) | 10-minute live demo script |
| [docs/team-workflow.md](docs/team-workflow.md) | Roles, Git workflow, handoffs |
| [client/Agent.md](client/Agent.md) | Binding contract for frontend AI agents (no backend edits) |
| [client/agents/](client/agents/) | Per-developer AI agent prompts |
| [docs/handoffs/tickets/](docs/handoffs/tickets/) | Frontend → backend request ticket workflow |

---

## 8. Security and privacy notes

- Passwords are hashed with Argon2 and never returned by the API.
- Sessions are stored server-side; only a SHA-256 hash of the cookie token is kept.
- All state-changing requests require a matching `X-CSRF-Token` header.
- Role checks are enforced on the server, not only in the UI.
- Rich-text HTML is sanitised before it is stored.
- Uploads are limited to PDF/PNG/JPG, 8 MB, and downloads require authorisation.
- Personal data can be exported and the account can be deleted from the portal.
- Invoices are retained after deletion because German tax law requires it.

Before going live: replace all demo company data, have the legal texts reviewed,
configure HTTPS and production cookies, set a strong database password, and set
`NODE_ENV=production` and `CLIENT_ORIGIN`.

---

## 9. License / use

Created for a graduation project. Use it as a learning base. Third-party
packages keep their own licenses.
