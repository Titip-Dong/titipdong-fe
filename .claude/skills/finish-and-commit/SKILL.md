---
name: finish-and-commit
description: Definition of done for a titipdong-fe change - verification commands, manual check against the local backend, docs sync, branch and commit format. Use before saying a task is done, before committing, and before pushing or opening a PR.
---

# Finish and commit

## 1. Verify (run them, read the output)

```sh
pnpm format
pnpm lint            # ESLint, including the cross-module import rule
pnpm build           # tsc -b + vite build
pnpm api:gen && git status --short -- src/api/generated   # must print nothing (CI checks this)
pnpm e2e             # when a user journey changed; needs the local backend (make db-up + make seed)
```

- UI changes: run the page against the local backend (`make db-up` + `make seed` in `../titipdong-be`, then
  `pnpm dev`) with the demo accounts, at phone and desktop width. Use the `design-review` skill.
- Report results as they are. If something failed or was skipped (backend not running, no browser check), say exactly
  that with the output. Never write "works" or "tested" for something not run in this session.

## 2. Docs in sync (same commit as the code)

- `docs/FLOWS.md`: any flow, action, hook, or invalidation that ended up different.
- `docs/PLAN.md`: mark phase items done when a phase's exit criteria are met; never mark unfinished work as done.
- `DESIGN.md`: a new or changed pattern, token, or component.
- `AGENTS.md`: a new cross-cutting rule, folder, env var, or the TODO list when an item is resolved.
- `README.md`: setup, scripts, or deployment changes.

## 3. Commit

### Branches

- `main` is production (every push deploys to the Azure Storage static website through
  `.github/workflows/deploy-storage.yml`); `dev` is integration.
- Cut branches from an up-to-date `dev`: `git switch dev && git pull --ff-only && git switch -c <branch>`.
- Names: `feat/<module>-<description>` or `fix/<module>-<description>` (`feat/order-request-form`); shared work uses
  the area (`feat/design-system`, `chore/api-sync`). Never commit directly to `dev` or `main`.
- **Branch → `dev`, no PR.** When every planned item on the branch is committed and the checks pass, summarize the
  commits and results and **ask the user** whether to merge into `dev`. Only after an explicit yes in this
  conversation:

  ```sh
  git push origin <branch>          # remote branch first, so it matches what is merged
  git switch dev && git pull --ff-only
  git merge --no-ff <branch> -m "Merge branch '<branch>' into dev"
  pnpm lint && pnpm build           # dev must stay green
  git push origin dev
  git branch -d <branch>
  ```

  If the merge conflicts or a check fails on `dev`, stop and report; do not push.

- **`dev` → `main` only when the user asks for a release**: the same steps with `dev` merged into `main`
  (`Merge branch 'dev'`). Pushing `main` deploys, so say that when asking.
- Remote branches are kept after merging.

### Granularity

- One commit per finished item (a page, a component, a flow), complete and passing the checks on its own. Never split
  one item by layer (types, then hooks, then page).
- Separate commits for refactors (`refactor`), docs-only changes (`docs`), tooling and config (`chore`), API client
  regeneration (`chore(api)`, unless it ships with the code that needs it), and fixes to earlier work (`fix`).

### Message

- Conventional Commits with the module as scope, imperative, lowercase, no trailing period:
  `feat(order): add request inbox page`, `fix(payment): refetch order after simulate`, `docs: add flows`,
  `chore(api): regenerate client from backend spec`, `refactor(trip): ...`. Scopes: `auth`, `trip`, `order`,
  `payment`, `shipment`, `dispute`, `notification`, `admin`, `api`, `ui`, `app`, `design`.
- Subject line only (`git commit -m "<subject>"`).
- **No AI attribution**: no `Co-Authored-By: Claude`, no "Generated with Claude Code", no session links. Do not pass
  `--author` or override `user.name` / `user.email`; the commit belongs to the local git identity.
- Never force-push or rewrite pushed history unless the user asked.
