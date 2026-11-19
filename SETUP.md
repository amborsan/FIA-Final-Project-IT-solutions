# Set up the presentation demo from a fresh clone

Use the same Git revision and a fresh local demo database on each team member’s computer. The repository contains the seed, database migrations, and public images. Each computer runs its own copy of PostgreSQL.

## 1. Install the prerequisites and clone

Install Git, Node.js 24 with npm, and PostgreSQL 16 or newer. Start PostgreSQL and have the password for your local database user ready. Use either `psql` or pgAdmin to manage the database.

```bash
git clone https://github.com/amborsan/FIA-Final-Project-IT-solutions.git
cd FIA-Final-Project-IT-solutions
git rev-parse --short HEAD
node --version
npm --version
```

For rehearsal, check out the branch or tag agreed by the team before installing. Compare the printed commit with a teammate’s. Run the following commands from the repository root. The three folders each have their own lockfile.

```bash
npm ci
npm --prefix client ci
npm --prefix server ci
```

## 2. Create a local demo database

Create an empty database named `fia_demo`. Adjust `postgres` if you use a different local user.

```bash
psql -h localhost -U postgres -c "CREATE DATABASE fia_demo;"
```

On Windows, if PowerShell cannot find `psql`, connect in pgAdmin and create `fia_demo` under **Databases → Create → Database**. For a repeat rehearsal with a clean starting state, create another empty database and use its name in the connection string.

## 3. Configure and seed the server

From the repository root, enter the server folder and copy the environment template. If you already have an environment file, check its database URL before applying migrations.

Linux or macOS:

```bash
cd server
cp .env.example .env
```

Windows PowerShell:

```powershell
cd server
Copy-Item .env.example .env
```

Edit `server/.env`. Replace `YOUR_LOCAL_PASSWORD` and, if needed, the username and port in this example. URL-encode any special characters in the credentials. Keep `PORT=3000` for the default Vite proxy and `NODE_ENV=development` for the local HTTP demo.

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_LOCAL_PASSWORD@localhost:5432/fia_demo?schema=public"
```

From `server/`, run the project’s Prisma commands with its committed config, then return to the root:

```bash
npm run db:deploy -- --config prisma7.config.ts
npm run db:generate -- --config prisma7.config.ts
npm run db:seed -- --config prisma7.config.ts
cd ..
```

A fresh database gets the catalog, users, sample requests and quotes, orders, tickets, reports, conversations, and CMS examples. Re-running the seed updates the catalog and can leave earlier logins and sample transaction state in place. Use an empty demo database to match your teammates’ starting point.

## 4. Start and verify the demo

From the repository root, start both processes with one command:

```bash
npm run dev
```

1. Open the [API health check](http://localhost:3000/api/health) and confirm it returns JSON with an OK status.
2. Open the [website](http://localhost:5173) and check the services and products pages. Vite forwards `/api` to port 3000. The default setup uses no `client/.env` override.
3. Check the service and product photos and sign in as an admin, technician, and customer. Sign out between roles or use separate browser profiles if you want multiple roles open.
4. Rehearse the [demo workflow](docs/demo-script.md) using the agreed starting database.

For the current seed, use the demo shortcuts on the login page or the local-only credentials printed by the seed. The existing accounts include `admin@fia-it.de`, `tech@fia-it.de`, and `customer@fia-it.de`. The three named team admin accounts are tracked in the [seed handoff](docs/handoffs/tickets/FE-20261119-presentation-seed.md).

## 5. Share the demo data and images

Keep the public website and service photos in [`client/public/site-photos`](client/public/site-photos/) and catalog photos in [`client/public/catalog`](client/public/catalog/). Keep the image credits and the source branding assets alongside the demo. These paths serve from the same origin on each computer and work offline once dependencies are installed. Files in `client/public` are also copied into the frontend build.

For a new, team-approved demo product photo, add the licensed image under `client/public/catalog/`. Use its same-origin path, for example `/catalog/my-product.webp`, as the product’s image URL. For everyone to see the same selection after seeding, the seed needs to reference the same URL. Dashboard edits stored only in a local database do not travel with a Git clone. The front end currently supplies shared fallback photos for seeded products without an image URL.

Before the team push, review `git status --short` and `git diff --cached --name-status`. Keep the project READMEs, this guide, the architecture and ERD, the API contract, test and team workflow docs, handoffs, demo and presentation notes, lockfiles, and demo images with credits. Leave out scratch prompts, temporary exports, private report attachments, database dumps, local `.env` files, and old build output.

## 6. Run the final build for rehearsal

After the seed and demo assets are agreed, stop the development processes with **Ctrl+C**. From the repository root:

```bash
npm --prefix client run build
npm --prefix server start
```

Open the [presentation build](http://localhost:3000). Express serves the compiled frontend and API together. Run Lighthouse against this address. Verify the catalog images and roles on the presentation laptop before the live demo.

Record the Git revision used for the final build. To distribute the exact verified output, attach an archive of `client/dist` to a GitHub Release for that revision. Teammates can extract it into `client/dist` and start Express with the command above. They still need to complete the database setup. Keep older local builds out of the team push.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `P1001` or `P1003` | Start PostgreSQL and verify the host, port, database name, and credentials in `server/.env`. |
| Prisma cannot find its config or seed command | Run the database scripts from `server/` with `--config prisma7.config.ts`. |
| `P2021` or a missing table | Apply the committed migrations to the demo database before seeding. |
| Missing generated Prisma client | Run the generate command in step 3. |
| `EADDRINUSE` on port 3000 or Vite starts on a different port | Stop the old local server using that port, then restart the root launcher. |
| API calls fail from the website | Check the health endpoint and use `localhost` consistently. Check for a stale `VITE_API_URL` override. |
| Old accounts or demo records appear | Check which database `server/.env` points to, then restart the server after correcting it. |
| Port 3000 serves only the API | Ensure `client/dist/index.html` exists before starting Express. Restart Express after building if it was already running. |
