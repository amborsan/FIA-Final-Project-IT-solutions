#!/usr/bin/env bash
# Frontend boundary check.
# Run from the client workspace with: npm run check:boundary
# It fails if any file under server/ was changed, added or deleted.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ℹ Not a git repository yet. Boundary check skipped."
  echo "  Frontend agents: do not edit server/ even when this check is skipped."
  exit 0
fi

changed_files="$(
  {
    # Tracked changes (staged + unstaged, including deletions and renames)
    git diff --name-only HEAD 2>/dev/null || true
    # New untracked files
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sort -u
)"

server_files="$(printf '%s\n' "$changed_files" | grep -E '^server(/|$)' || true)"
contract_files="$(printf '%s\n' "$changed_files" | grep -E '^docs/(api\.md|database-erd\.md|architecture\.md)$' || true)"

if [[ -n "$server_files" ]]; then
  echo "✖ BACKEND BOUNDARY VIOLATION"
  echo
  echo "The following server/ files were changed:"
  echo "$server_files" | sed 's/^/  - /'
  echo
  echo "Frontend agents must not modify the backend."
  echo "1. Revert these files:"
  echo "     git restore --staged <file>   # if staged"
  echo "     git restore <file>            # working tree"
  echo "     rm <file>                     # if newly created"
  echo "2. Create a ticket from docs/handoffs/tickets/TEMPLATE.md."
  echo "3. Link it in docs/handoffs/frontend-to-backend.md."
  echo "4. Tell the backend developer only."
  echo
  exit 1
fi

if [[ -n "$contract_files" ]]; then
  echo "⚠ Contract documentation changed:"
  echo "$contract_files" | sed 's/^/  - /'
  echo "  docs/api.md, database-erd.md and architecture.md are backend-owned."
  echo "  If this was intentional, the backend developer must review it."
  echo
fi

echo "✔ Frontend boundary check passed: no server/ files changed."
