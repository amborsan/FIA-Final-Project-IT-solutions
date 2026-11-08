# Local setup and seeding guide

This guide is for every team member who clones the project and wants to run it
locally with the demo data.

It covers:

1. creating the PostgreSQL database,
2. configuring the server environment,
3. applying migrations,
4. generating the Prisma client,
5. seeding the demo data,
6. starting the backend and frontend,
7. verifying everything works,
8. fixing the most common setup errors.

> The commands below are written for Linux/macOS. Windows notes are included at
> the end. You must have Node.js 22+ and PostgreSQL 16+ installed.

---

## 0. Go to the repository root

```bash
cd path/to/FIA-Final-Project-IT-solutions
```

Replace `path/to` with the folder where you cloned the project.

---

## 1. Create the PostgreSQL database

Use the database name `fia` (or any name you prefer, as long as you use the same
name in `server/.env`).

```bash
createdb -h localhost -U postgres fia
```

If `createdb` is not available, use `psql`:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE fia;"
```

Check that it exists:

```bash
psql -h localhost -U postgres -lqt
```

You should see `fia` in the list.

---

## 2. Go into the server folder

**Important:** all database and seed commands must run from `server/`, because
that is where `package.json` and the Prisma configuration live.

```bash
cd server
```

If you run `npm run db:seed` from the repository root, you will get:

```text
npm error enoent Could not read package.json
```

That is not a database problem. It only means you are in the wrong folder.

> **Important — do not run `npx prisma` from the repository root.**
> There is no root `package.json`, so `npx` may download a newer Prisma CLI
> (for example Prisma 8 RC) instead of the Prisma 7 version pinned in `server/`.
> That newer CLI prints errors such as `CLI.COMMAND_MOVED: migrate deploy has
> been replaced` and suggests `prisma db migrate`, which does not exist in
> Prisma 7.10.1.
>
> Always run Prisma commands **from `server/`**, or use the npm scripts below.
> Correct: `cd server && npm run db:deploy`
> Wrong: `npx prisma migrate deploy` at the repository root.

---

## 3. Create `server/.env`

`.env` is intentionally not committed to Git, so every developer creates their
own copy.

```bash
cp .env.example .env
```

Open `server/.env` and set your database:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fia?schema=public"
PORT=3000
HOST=localhost
CLIENT_ORIGIN="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
NODE_ENV=development
```

Replace `postgres:postgres` with your PostgreSQL username and password if they
are different.

> Each developer should use their **own** local database and their own `.env`.
> Do not copy someone else’s `.env` blindly.

---

## 4. Install server dependencies

```bash
npm install
```

If `node_modules` already exists, this still makes sure all packages are
installed.

---

## 5. Apply the database migrations

```bash
npm run db:deploy
```

Use `migrate deploy` for a new or existing database. It applies the committed
migrations without creating new ones.

If the database is empty, this creates all tables.

---

## 6. Generate the Prisma client

```bash
npm run db:generate
```

`migrate deploy` does not always generate the type-safe Prisma client, so run
this explicitly after installing or migrating.

---

## 7. Seed the demo data

```bash
npm run db:seed
```

Expected output:

```text
Running seed command `tsx prisma/seed.ts` ...
Seeding Orbit IT Solutions demo data...
Seed complete.
Admin:    admin@fia-it.de / Admin12345!
Tech:     tech@fia-it.de / Tech12345!
Customer: customer@fia-it.de / Customer12345!
Business: business@fia-it.de / Customer12345!

🌱  The seed command has been executed.
```

### What the seed creates

- 5 demo users
- 10 services
- 14 products and their categories
- demo requests, quotes, orders, invoices
- tickets, appointments and service reports
- support and staff chat conversations
- published and draft CMS pages
- contact messages, notifications and activity entries

### Re-running the seed

The seed is designed to be safe to run again:

- services and products are updated by their unique slug,
- demo users are matched by fixed IDs,
- sample transactions are only created when the database has no requests yet.

If you changed the demo email domain, an already-seeded database will still have
the old user emails because the seed does not overwrite existing users. To get
the new demo accounts, use a **fresh database** or reset a development database
(see section 8).

---

## 8. Start the backend

Keep this terminal open:

```bash
npm run dev
```

Expected:

```text
API running at http://localhost:3000
```

The API health check should return JSON:

```bash
curl http://localhost:3000/api/health
```

```json
{ "status": "ok", "service": "Orbit IT Solutions API" }
```

---

## 9. Start the frontend (second terminal)

Open a new terminal:

```bash
cd path/to/FIA-Final-Project-IT-solutions/client
npm install
npm run dev
```

Expected:

```text
VITE ready
Local: http://localhost:5173/
```

Open:

```text
http://localhost:5173
```

The Vite development server proxies `/api` to `http://localhost:3000`, so keep
the backend running.

---

## 10. Log in

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fia-it.de` | `Admin12345!` |
| Technician | `tech@fia-it.de` | `Tech12345!` |
| Technician 2 | `tech2@fia-it.de` | `Tech12345!` |
| Customer (individual) | `customer@fia-it.de` | `Customer12345!` |
| Customer (business) | `business@fia-it.de` | `Customer12345!` |

The login page also has demo cards that fill in these details.

---

## 11. Verify the seed worked

In any terminal:

```bash
psql -h localhost -U postgres -d fia -c "\dt"
```

You should see the project tables.

Check the important counts:

```bash
psql -h localhost -U postgres -d fia -c "SELECT count(*) FROM services;"
psql -h localhost -U postgres -d fia -c "SELECT count(*) FROM products;"
psql -h localhost -U postgres -d fia -c "SELECT count(*) FROM users;"
```

Expected:

| Table | Expected count |
| --- | --- |
| `services` | 10 |
| `products` | 14 |
| `users` | 5 |

You can also open Prisma Studio:

```bash
cd server
npx prisma studio
```

---

## 12. Production-style run (optional)

If you want Express to serve the built frontend:

```bash
cd client
npm install
npm run build

cd ../server
npm start
```

Open:

```text
http://localhost:3000
```

For normal development, use the Vite server (`npm run dev` in `client/`) instead.

---

## 13. Reset a development database

Only do this if the database contains **no data you need**. It deletes all data.

```bash
cd server
npx prisma migrate reset
npm run db:seed
```

`migrate reset` is destructive. Never run it against a production database.

If you only created the wrong database name, it is usually safer to create a new
database and change `DATABASE_URL` instead of resetting anything.

---

## 14. One-command setup after the first install

Once `.env` exists and the database is created, the server setup can be repeated
with:

```bash
cd server \
  && npm install \
  && npm run db:deploy \
  && npm run db:generate \
  && npm run db:seed \
  && npm run dev
```

Then in a second terminal:

```bash
cd client \
  && npm install \
  && npm run dev
```

---

## 15. Common errors and fixes

| Error | Cause | Fix |
| --- | --- | --- |
| `ENOENT ... package.json` | Ran npm from the repository root | `cd server` first |
| `CLI.COMMAND_MOVED: migrate deploy has been replaced` | `npx prisma` ran at the repo root and downloaded Prisma 8 RC, not the local Prisma 7 | `cd server` and use `npm run db:deploy` |
| `P1003: database "..." does not exist` | Wrong database name or DB not created | Create it and update `DATABASE_URL` |
| `P1001: can't reach database server` | PostgreSQL is not running or wrong host/port | Start PostgreSQL; check host and port |
| `P2021: table does not exist` | Migrations were not applied | `npm run db:deploy` |
| `Cannot find module .../generated/prisma` | Prisma client missing | `npm run db:generate` |
| Seed runs but old users remain | You used the old `orbit_platform` database; fixed-ID upserts do not change emails | Point `.env` to the new DB (e.g. `fia`) and seed the empty DB |
| Seed runs but the frontend still shows old data | Backend is using a different database | Check `server/.env` and restart `npm run dev` |
| `EADDRINUSE :3000` | Port 3000 is already used | Stop the old backend or change `PORT` |
| Frontend requests fail | Backend is not running | Start `server` before `client` |
| Login fails after seed | Wrong database or old seed | Verify `users` count and emails in the correct DB |

---

## 16. Windows notes

Use PowerShell:

```powershell
cd path\to\FIA-Final-Project-IT-solutions\server
copy .env.example .env
npm install
npm run db:deploy
npm run db:generate
npm run db:seed
npm run dev
```

Create the database with pgAdmin or:

```powershell
psql -h localhost -U postgres -c "CREATE DATABASE fia;"
```

In `server/.env`, keep the URL on one line:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fia?schema=public"
```

---

## 17. What must never be committed

- `server/.env`
- `client/.env`
- `node_modules/`
- `client/dist/`
- uploaded files in `server/storage/reports/`
- database dumps or passwords

Commit `server/.env.example` and `client/.env.example` only.

---

## 18. Quick copy-paste block for the team

Linux/macOS:

```bash
# 1. Create DB
createdb -h localhost -U postgres fia

# 2. Server setup (all Prisma commands run from server/)
cd FIA-Final-Project-IT-solutions/server
cp .env.example .env
# edit DATABASE_URL in .env to use database "fia"
npm install
npm run db:deploy
npm run db:generate
npm run db:seed
npm run dev
```

Second terminal:

```bash
cd FIA-Final-Project-IT-solutions/client
npm install
npm run dev
```

Open `http://localhost:5173`.

---

If anything still fails, copy the **exact command and full error output** and
check the troubleshooting table above before changing any files.
