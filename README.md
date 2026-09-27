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

3. Add the API URL as a build-time application setting. The AKS smoke deployment is currently internal-only
   (`ClusterIP` and `kubectl port-forward`), so a public HTTPS API endpoint must be configured before a deployed
   Static Web App can call it.

   | Variable       | Production value                          |
   | -------------- | ----------------------------------------- |
   | `VITE_API_URL` | Public HTTPS URL of the published AKS API |

4. Configure GitHub Actions deployment through the Azure Static Web Apps integration. Pushes to `main` should deploy
   production; pull requests can create temporary preview environments when enabled in Azure.
5. Add a custom frontend domain (for example, `app.titipdong.id`) in Azure Static Web Apps and point its DNS record
   to the Azure-provided hostname.

Notes:

- Configure an SPA fallback so deep links are served by `index.html` rather than returning a static 404 response.
- The prototype uses an internal mock-payment flow. It has no Midtrans/Snap client key or script URL.
- Configure an SPA fallback in an Azure Static Web Apps configuration file before production deployment so deep links
  resolve to `index.html`.
- Configure backend CORS for the production frontend origin and `http://localhost:5173` when the public API is added.
- Enable branch protection on `main` and require a green `check` status before merge.
