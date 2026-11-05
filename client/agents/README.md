# Frontend agent prompts

These files tell AI coding agents how to work with the frontend developers.
They are deliberately strict about the backend boundary.

## Which file to use

| File | Use it for |
| --- | --- |
| `../Agent.md` | The full binding contract. Read by every frontend agent. |
| `frontend-developer-1/Agent.md` | Agent prompt for the public website + customer portal developer. |
| `frontend-developer-2/Agent.md` | Agent prompt for the staff dashboards + infrastructure developer. |
| `../AGENTS.md` | Short workspace reminder for tools that auto-load `AGENTS.md`. |

## How to start an AI session

1. Open the workspace at `client/` (or the `frontend-starter/` copy).
2. Give the agent the relevant role file, for example:

   > Read `client/Agent.md` and `client/agents/frontend-developer-1/Agent.md` before
   > doing anything. Follow them strictly.

3. For a task that is only UI, no ticket is needed.
4. For anything needing a backend change, the agent must create a ticket in
   `docs/handoffs/tickets/` and tell the backend developer. It must not edit
   `server/`.

## Non-negotiable rules

- `server/` is owned by the backend developer only.
- Frontend agents must not edit, format, delete or run commands against `server/`.
- Backend requests go to `docs/handoffs/tickets/` and to the backend developer
  directly.
- One ticket = one backend change.
- The backend developer writes the decision in the ticket.
- `npm run check:boundary` must pass before finishing.

## If an agent ignores the rules

1. Stop the agent.
2. Revert any `server/` change.
3. Re-read `../Agent.md`.
4. Create/refresh the backend ticket.
5. Tell the backend developer.

Do not merge or present work that silently changes backend code.
