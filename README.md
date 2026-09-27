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

## Deploy (Azure Static Web Apps)

The frontend is deployed as a static Vite application on Azure Static Web Apps.

1. Create an Azure Static Web App connected to this repository and its production branch (`main`).
2. Configure the build:

   | Setting         | Value        |
   | --------------- | ------------ |
   | App location    | `/`          |
   | API location    | _(empty)_    |
   | Output location | `dist`       |
   | Build command   | `pnpm build` |
   | Node.js version | `22`         |

3. Add these application settings for production. Use the corresponding AKS API URL for preview or staging
   environments when they exist.

   | Variable                   | Production value                        |
   | -------------------------- | --------------------------------------- |
   | `VITE_API_URL`             | Public HTTPS URL of the AKS API Ingress |
   | `VITE_MIDTRANS_CLIENT_KEY` | Mock or sandbox client key              |
   | `VITE_MIDTRANS_SNAP_URL`   | Mock or sandbox Snap script URL         |

4. Configure GitHub Actions deployment through the Azure Static Web Apps integration. Pushes to `main` should deploy
   production; pull requests can create temporary preview environments when enabled in Azure.
5. Add a custom frontend domain (for example, `app.titipdong.id`) in Azure Static Web Apps and point its DNS record
   to the Azure-provided hostname.

Notes:

- Configure an SPA fallback so deep links are served by `index.html` rather than returning a static 404 response.
- The `public/_headers` file is Cloudflare-specific. Equivalent security and cache headers must be configured through
  Azure Static Web Apps configuration or an Azure-supported configuration file before production deployment.
- The frontend and backend should share a parent domain (for example, `app.titipdong.id` and `api.titipdong.id`) so
  refresh-token cookies can use `SameSite=Lax`. Backend CORS must allow the production frontend origin, any approved
  Azure Static Web Apps preview origins, and `http://localhost:5173` with `Access-Control-Allow-Credentials: true`.
- Enable branch protection on `main` and require a green `check` status before merge.
