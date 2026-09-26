# titipdong-fe

TITIP DONG frontend: React 19 + Vite + TypeScript, Tailwind CSS v4 + shadcn/ui, TanStack Query, Zustand, orval.

Architecture, cross-module rules, conventions, and design guidelines live in [AGENTS.md](AGENTS.md). Coding agents
read that file automatically (Claude Code via `CLAUDE.md`, Cursor, Codex, etc.), so add new rules there. The visual
guide is available at `http://localhost:5173/styleguide` while running `pnpm dev`.

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:5173
```

## Scripts

| Script                              | Description                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Dev server                                                                            |
| `pnpm build`                        | Type check + production build to `dist/`                                              |
| `pnpm lint`                         | ESLint (including the cross-module import rule)                                       |
| `pnpm format` / `pnpm format:check` | Prettier                                                                              |
| `pnpm typecheck`                    | Type check only                                                                       |
| `pnpm api`                          | Pull `openapi.json` from the backend and generate the client (`api:pull` + `api:gen`) |

Use `API_URL=https://... pnpm api` to pull the spec from a backend other than `localhost:8080`.

## Modules

Each module lives in `src/features/<module>/`. Other modules may **only import from `@/features/<module>`**
(`index.ts`).

| Folder         | Module               |
| -------------- | -------------------- |
| `auth`         | F01 Auth & User      |
| `trip`         | F02 Trip & Catalog   |
| `order`        | F03 Order            |
| `payment`      | F04 Payment & Escrow |
| `shipment`     | F05 Shipment         |
| `dispute`      | F06 Dispute          |
| `notification` | F07 Notification     |
| `admin`        | F08 Admin            |

## Deploy (Cloudflare Pages)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, and pick this repo.
2. Build settings: **Vite** preset, build command `pnpm build`, output directory `dist`, environment variable
   `NODE_VERSION=22`.
3. Set environment variables for **Production** and **Preview** separately:

   | Variable                   | Production                 | Preview             |
   | -------------------------- | -------------------------- | ------------------- |
   | `VITE_API_URL`             | `https://api.titipdong.id` | Staging backend URL |
   | `VITE_MIDTRANS_CLIENT_KEY` | Sandbox client key         | Sandbox client key  |
   | `VITE_MIDTRANS_SNAP_URL`   | Sandbox Snap URL           | Sandbox Snap URL    |

4. Pushes to `main` deploy to production automatically; every PR gets a `*.pages.dev` preview URL.
5. Add a custom domain (e.g. `app.titipdong.id`) under **Custom domains**.

Notes:

- SPA fallback works automatically as long as the output has no `404.html`, so do not add one to `public/`.
- Security and cache headers are set in `public/_headers`.
- To agree on with the backend: FE and BE should share a parent domain (e.g. `app.` and `api.titipdong.id`) so the
  refresh token cookie can use `SameSite=Lax`, and backend CORS must allow the production origin, `*.pages.dev`
  previews, and `http://localhost:5173` with `Access-Control-Allow-Credentials: true`.
- Enable branch protection on `main` (require a PR and a green `check` status).
