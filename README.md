# titipdong-fe

TITIP DONG frontend: React 19 + Vite + TypeScript, Tailwind CSS v4 + shadcn/ui, TanStack Query, Zustand, orval.

Architecture, cross-module rules, conventions, and design guidelines live in [AGENTS.md](AGENTS.md). Coding agents
read that file automatically (Claude Code via `CLAUDE.md`, Cursor, Codex, etc.), so add new rules there. The visual
guide is available at `http://localhost:5173/styleguide` while running `pnpm dev`.

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8080
pnpm dev                     # http://localhost:5173
```

The frontend needs the backend from the sibling `titipdong-be` repo. Start it there with `make db-up` (PostgreSQL,
Azurite, and the API at `http://localhost:8080`, docs at `/docs`) and create the demo accounts with `make seed`:

| Role     | Email                     | Password    |
| -------- | ------------------------- | ----------- |
| Pembeli  | `buyer@titipdong.test`    | `demo12345` |
| Jastiper | `jastiper@titipdong.test` | `demo12345` |
| Admin    | `admin@titipdong.test`    | `demo12345` |

The backend's default `CORS_ORIGINS` already allows `http://localhost:5173`. Locally it must run with
`COOKIE_SECURE=false`, or the refresh cookie is not stored over plain HTTP.

## Scripts

| Script                              | Description                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Dev server                                                                            |
| `pnpm build`                        | Type check + production build to `dist/`                                              |
| `pnpm lint`                         | ESLint (including the cross-module import rule)                                       |
| `pnpm format` / `pnpm format:check` | Prettier                                                                              |
| `pnpm typecheck`                    | Type check only                                                                       |
| `pnpm api`                          | Pull `openapi.json` from the backend and generate the client (`api:pull` + `api:gen`) |
| `pnpm api:gen`                      | Regenerate the client from the committed `openapi/openapi.json`                       |

Use `API_URL=https://... pnpm api` to pull the spec from a backend other than `localhost:8080`. Run it whenever the
backend contract changes and commit `openapi/` and `src/api/generated/` together; CI fails when they do not match.

## Modules

Each module lives in `src/features/<module>/`. Other modules may **only import from `@/features/<module>`**
(`index.ts`).

| Folder         | Module               | Status                                                      |
| -------------- | -------------------- | ----------------------------------------------------------- |
| `auth`         | F01 Auth & User      | Pages implemented                                           |
| `trip`         | F02 Trip & Catalog   | Pages implemented                                           |
| `order`        | F03 Order            | Pages implemented                                           |
| `payment`      | F04 Payment & Escrow | Pages implemented                                           |
| `shipment`     | F05 Shipment         | `ShipmentPanel` on the order detail page                    |
| `dispute`      | F06 Dispute          | Placeholder pages                                           |
| `notification` | F07 Notification     | Placeholder page; bell links to `/notifications` (no badge) |
| `admin`        | F08 Admin            | Placeholder pages                                           |

Every backend module (F01–F08) is done, so the generated hooks for the remaining pages already exist. Backend
documentation per module lives in `titipdong-be/docs/features/`.

## Deploy (Azure Static Web Apps)

The frontend is deployed as a static Vite application on Azure Static Web Apps. The backend runs on AKS
(`titipdong-be/deploy/k8s/README.md`).

- `.github/workflows/deploy-static-web-app.yml` runs on every push to `main`: it installs, regenerates the client,
  builds with `VITE_API_URL`, and uploads `dist/` using the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret.
- `public/staticwebapp.config.json` configures the SPA fallback so deep links are served by `index.html`.
- The prototype uses the backend's fake payment gateway. It has no Midtrans/Snap client key or script URL.
- Enable branch protection on `main` and require a green `check` status before merge.

Before the deployed app can talk to the backend:

1. The backend needs a public HTTPS Ingress. Its LoadBalancer endpoint is HTTP only, and browsers block HTTPS-to-HTTP
   calls.
2. Put the frontend and the API under custom domains of one parent domain (for example `app.titipdong.id` and
   `api.titipdong.id`). The refresh cookie is `SameSite=Lax`, so with the frontend on `*.azurestaticapps.net` the
   browser does not send it and users are signed out on every reload.
3. Replace the placeholder `VITE_API_URL` (`https://api.titipdong.invalid`) in the deploy workflow with the API URL.
4. Set the backend's `CORS_ORIGINS` (ConfigMap `titipdong-api-config`) to the frontend origin.
