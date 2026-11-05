# Pull request checklist

## What changed

- [ ] Frontend UI / component / translation
- [ ] Frontend tests / tooling
- [ ] Backend API / database (backend developer PR only)
- [ ] Documentation

## Frontend PRs — backend boundary

- [ ] **No file under `server/` is changed** (verified with `npm run check:boundary`)
- [ ] No edited `docs/api.md` / `docs/database-erd.md` / `docs/architecture.md`
- [ ] Any backend requirement is in `docs/handoffs/tickets/FE-…`
- [ ] The backend developer has been told about the ticket
- [ ] No temporary backend workaround or mock in production code

## Quality

- [ ] `cd client && npm run lint` passes (frontend)
- [ ] `cd client && npm run build` passes (frontend)
- [ ] `cd server && npm run build && npm test` passes (backend)
- [ ] New UI text exists in **English and German**
- [ ] Checked at 360 px and desktop width
- [ ] No secrets, `.env` content or tokens in the diff
- [ ] Loading, empty and error states are present
- [ ] Role/permission behaviour was tested for the relevant user

## Screenshots / notes

Add a screenshot for visual changes and link the relevant ticket or issue.
