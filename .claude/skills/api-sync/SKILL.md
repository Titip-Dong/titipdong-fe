---
name: api-sync
description: Sync titipdong-fe with the backend contract - pull openapi.json, regenerate the orval client, find what broke or changed, and update docs/FLOWS.md. Use when the backend changed, when a hook or field the code expects is missing from src/api/generated, or before starting a phase.
---

# API sync

`openapi/openapi.json` and `src/api/generated/` always change together and are never edited by hand.

## 1. Regenerate

1. The backend must be running: `curl -sf http://localhost:8080/health` (start it with `make db-up` in
   `../titipdong-be`). For another backend: `API_URL=https://... pnpm api`.
2. `pnpm api` (pulls the spec, runs orval; the orval hook formats the output with Prettier).
3. Confirm the output is stable: running `pnpm api:gen` again must leave `git status` unchanged. CI regenerates and
   fails on any diff.

## 2. See what changed

- Operations added or removed per tag:
  ```sh
  git diff --stat -- src/api/generated
  git status --short -- src/api/generated     # new files = new operations or types
  ```
- Changed fields and enums: read the diff of `src/api/generated/model/` for the types the app uses.
- Breakage: `pnpm typecheck`. Every error is a contract change; fix the calling code, never the generated code.
- Enum changes that TypeScript catches only partly: order status (`OrderResponseStatus` in `OrderStatusBadge`),
  trip status, notification types (`docs/FLOWS.md` §6), dispute categories.

## 3. Keep docs in sync

- `docs/FLOWS.md`: hooks, fields, statuses, and rules that changed. Update the "last synced" line at the top.
- `AGENTS.md`: only when a cross-cutting rule changed (auth, uploads, pagination, errors).
- If the backend docs (`../titipdong-be/docs/`) disagree with the new spec, tell the user; the backend repo fixes
  its docs, not this one.

## 4. Verify and commit

`pnpm format && pnpm lint && pnpm build`, then commit `openapi/` and `src/api/generated/` together, in the same
commit as any code fix the change required (`chore(api): regenerate client from backend spec`, or a `feat`/`fix`
commit of the module that needed the new field). Use the `finish-and-commit` skill.
