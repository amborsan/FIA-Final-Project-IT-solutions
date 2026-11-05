# Frontend starter (outside the project)

Location: `../frontend-starter` (sibling of `01/`)

The starter is an empty, technically ready copy of the frontend stack. It exists
so the two frontend developers can build their own version without risking the
working full-stack project.

## What is ready

- React 19 + TypeScript + Vite 8
- TanStack Router (file routes + generated tree)
- TanStack Query (QueryClient + provider)
- Tailwind CSS 4 + DaisyUI 5 with the same `orbit` theme
- Lucide icons
- English/German i18n provider with a small starter dictionary
- API client with cookies and CSRF header
- `/api` Vite proxy to port 3000
- ESLint + TypeScript configs
- Starter home page that calls `/api/health` and `/api/services`
- `AGENTS.md` and `Agent.md` with the frontend-only rules and backend-ticket process

## What is intentionally missing

- Login/register and auth context
- Cart
- Customer/technician/admin pages
- Legal pages
- Chat widget

That is the work of the frontend team. The complete implementation in
`../01/client` is the reference.

## Run it

```bash
cd ../frontend-starter
npm install
npm run dev
```

Start the backend first (`cd ../01/server && npm run dev`). Then open
`http://localhost:5173`.

## Build it

```bash
npm run build
```

## Rules

- Do not edit `../01/server`.
- Do not edit `routeTree.gen.ts`.
- Add all labels in both EN and DE.
- Keep the existing stack and theme.

The starter was built and type-checked before handoff. `node_modules` and
`dist` were removed to keep the folder small; run `npm install` once.
