# AGENTS.md — titipdong-fe

Shared context for coding agents (Claude Code, Cursor, Codex, etc.) and team members working on the TITIP DONG frontend.
The full product plan lives in the `titipdong-docs` repo (`PLAN.md`); per-feature specs are in `titipdong-docs/features/<ID>/`.

## Product

TITIP DONG is an escrow-backed jastip (personal shopper) platform. A **Jastiper** (someone who is traveling) opens a
trip, a **Pembeli** (buyer) asks them to buy items, and the money is held by the platform and only released to the
Jastiper (minus a 5% fee) after the buyer receives the items. For this prototype, registration is simple and an
**Admin** resolves disputes; there is no KYC upload or verification.

Order status: `Requested → Approved → Paid → Shipped → Delivered → Released`, with branches to `Rejected`,
`Cancelled`, `Refunded`, and `Disputed`. Only the backend (Go, modular monolith) changes order status.

## Language

- Code, identifiers, code comments, commit messages, and docs (this file, README): **English**.
- User-facing UI copy: **Indonesian**, casual, addressing the user as "kamu" (the users are Indonesian).
- Domain terms stay as-is: jastip, jastiper, pembeli, titipan, nota titipan.

## Stack

- Node 22 (`.nvmrc`), pnpm (version pinned in `packageManager`; enable with `corepack enable`)
- React 19 + Vite 8 + TypeScript 6 (strict)
- React Router **v8** in library mode (`createBrowserRouter`, `lazy` routes)
- Tailwind CSS v4 + shadcn/ui (Radix base, Nova preset)
- TanStack Query v5 (server data), Zustand (client state only)
- React Hook Form + **Zod v4** (`z.url()`, not `z.string().url()`)
- orval: TanStack Query hooks, types, and Zod schemas generated from the backend OpenAPI spec
- Internal mock payment flow for the prototype; target hosting is Azure Static Web Apps

## Commands

```bash
pnpm dev             # http://localhost:5173 (visual guide at /styleguide, dev only)
pnpm build           # tsc -b + vite build
pnpm lint            # ESLint, including the cross-module import rule
pnpm format          # Prettier (CI runs format:check)
pnpm typecheck
pnpm api             # pull openapi.json from the backend (API_URL, default localhost:8080), then generate
pnpm api:gen         # regenerate from the existing openapi/openapi.json
```

Before calling a task done, run `pnpm format && pnpm lint && pnpm build`. CI (`.github/workflows/ci.yml`) runs the
same checks and also verifies that `src/api/generated/` matches `openapi/openapi.json`.

## Structure

```
openapi/openapi.json        copy of the backend spec (committed)
src/api/client.ts           orval mutator `apiFetch`: base URL, bearer token, auto refresh on 401, ApiError
src/api/generated/          orval output. NEVER edit by hand
src/app/                    App (providers), router.tsx (all routes), guards.tsx (RequireAuth, RequireRole)
src/components/ui/          shadcn components (ours to edit, after discussing with the team)
src/components/layout/      MainLayout, Navbar, Footer, PlaceholderPage, NotFoundPage, FullPageLoader
src/components/*.tsx        shared components: OrderStatusBadge, ProductImage, ProductTile, Receipt
src/features/<module>/      pages/, components/, hooks/, schemas.ts, index.ts (public exports)
src/lib/                    env.ts (env validation), format.ts (formatRupiah, formatDate), utils.ts (cn)
src/stores/auth.ts          Zustand: accessToken + user (no persist)
```

## Modules and ownership

| Folder         | Module               | Owner  | Pages                                                                         |
| -------------- | -------------------- | ------ | ----------------------------------------------------------------------------- |
| `auth`         | F01 Auth & User      | Carlo  | `/login`, `/register`, `/profile`                                             |
| `trip`         | F02 Trip & Catalog   | Carlo  | `/`, `/trips`, `/trip/:slug`, `/my-trips`, `/my-trips/new`                    |
| `order`        | F03 Order            | Alfian | `/trip/:slug/request`, `/my-trips/:id/requests`, `/orders`, `/orders/:id`     |
| `payment`      | F04 Payment & Escrow | Barru  | `/orders/:id/pay`, `/wallet`                                                  |
| `shipment`     | F05 Shipment         | Alfian | components inside `/orders/:id` (no pages of its own)                         |
| `dispute`      | F06 Dispute          | Barru  | `/orders/:id/dispute`, `/admin/disputes`                                      |
| `notification` | F07 Notification     | Azfa   | `/notifications`, navbar icon                                                 |
| `admin`        | F08 Admin            | Azfa   | admin layout, `/admin`, `/admin/transactions`, `/admin/users`, `/admin/audit` |

Only change the module folder you are working on. Changes to `src/components/`, `src/app/`, `src/lib/`,
`src/stores/`, `src/index.css`, and `src/api/client.ts` affect every module: ask the user first.

## Rules

### Cross-module boundaries

- Other modules are imported only through `@/features/<module>` (`index.ts`). Importing `@/features/<module>/<anything>`
  is rejected by ESLint.
- Inside a module, use relative imports (`./components/...`, `../hooks/...`).
- Components embedded in another module's page are exported from their own module's `index.ts`
  (e.g. `PaymentStatusCard` from F04 and `ShipmentPanel` from F05 are used on F03's order detail page).
- Code with no owner (formatting, layout, generic UI) goes in `src/lib/` or `src/components/`.
- Exception: `src/app/router.tsx` may import page files directly.

### Routing

- Every page exports its component as `export function Component()` and is registered in `src/app/router.tsx`
  with `lazy: () => import(...)`.
- Frontend guards are UX only. Real authorization happens in the backend.
- `RequireAuth` passes `state.from` to `/login`; the login page must navigate back to `from` after success.

### Data and API

- Never hand-write request/response types or fetch functions. Use the orval hooks and types from
  `@/api/generated/...`, and the Zod schemas from `@/api/generated/zod/...` as React Hook Form resolvers.
- Backend endpoints are tagged by module name, so orval output is split per module.
- Need a new endpoint or field: change the backend, run `pnpm api`, and commit `openapi/` + `src/api/generated/`
  together with the FE change that uses it. Never edit `src/api/generated/`.
- Server data goes through TanStack Query only. Zustand is for client state (session, UI preferences); never copy
  API data into Zustand.
- After a mutation, invalidate the related queries (e.g. after approving an order: the request list and order detail).
- Backend errors use RFC 9457 (`application/problem+json`) and are read from `ApiError.body`.

### Money

- Money from the API is an integer amount of rupiah. Display it with `formatRupiah()` and the `tabular-nums` class.
- Never calculate prices, fees, or totals in the frontend. Final amounts always come from the backend.

### Auth

- The access token lives in memory only (`useAuthStore`, no `persist`); the refresh token is an HttpOnly cookie set
  by the backend.
- `main.tsx` calls `refreshAccessToken()` once on app load; the router renders only after `initialized`.
  Do not move this into a `useEffect` (StrictMode runs effects twice).

### Payments (F04)

- Payments use the internal prototype mock, not Midtrans Snap or a real payment gateway.
- Only the backend changes an order to _Paid_. The frontend completes the mock payment UI and refetches the order.

### Environment

- Access env vars only through `env` from `@/lib/env` (validated with Zod). New variables go in `.env.example`,
  `src/lib/env.ts`, and `src/vite-env.d.ts`.
- Every `VITE_*` variable ends up in the public bundle. Never put secrets there (storage credentials or any future
  external-service keys).

## Design and UI

Direction: **safe shopping through jastip**. Products are the star; trust signals such as mock escrow are visible.
Living reference: `/styleguide` (`src/components/styleguide/StyleguidePage.tsx`).

- The visual system follows the logo (`public/titipdong-logo.png`, navbar uses `titipdong-logo-navbar.png`):
  solid red blocks, bold white geometric type, small radii.
- Use the tokens in `src/index.css`; never hardcode colors. Palette: Merah `#DD010F` (`primary`, brand color,
  primary actions and trust signals; a full-red surface with white text only on the landing hero), Tinta (text),
  Kertas (background), Garis (borders), Rambu `#F5C400` (`highlight`, attention only such as waiting states, with dark
  text, never as a text color), Cap `#8F1420` (`destructive`, errors and disputes; kept darker than Merah).
- Font: Plus Jakarta Sans for everything; `h1`–`h3` get the extra-bold heading style automatically (or `font-heading`).
- Lead with product photos: `ProductImage`, `ProductTile`. Trip lists show item thumbnails, not just the schedule.
- Order details use `Receipt` (nota titipan): item and price breakdown on top, payment status and actions below the
  tear line.
- Order status always goes through `OrderStatusBadge` so colors match across modules.
- Avoid airport/boarding-pass/logistics motifs, grids of identical cards for non-product data, ALL-CAPS labels, and
  `→` arrows in button text.
- UI copy: casual Indonesian with "kamu", active voice, button labels that name the action ("Bayar sekarang", not
  "Submit"). Error messages explain how to fix the problem; empty states invite the user to act.
- Required: responsive down to phone width (no horizontal scroll), visible keyboard focus, AA contrast.

## Git conventions

- Branches: `feat/<module>-<description>` or `fix/<module>-<description>`, e.g. `feat/order-request-form`.
- Commits: Conventional Commits scoped by module, e.g. `feat(order): add request inbox page`.
- Everything reaches `main` through a PR with green CI. Azure Static Web Apps deployment is planned once the public
  backend Ingress and frontend Azure workflow are configured.

## Temporary (TODO)

- `openapi/openapi.json` is generated from the backend contract. Auth routes are implemented with PostgreSQL and JWT; generate clients with `pnpm api` whenever the contract changes.
- KYC routes/pages and Midtrans files were removed because they are outside the prototype plan.
- `AuthUser` in `src/stores/auth.ts`, the `/auth/refresh` path, and the `accessToken`/`user` field names are
  assumptions (F01).
- Status values in `OrderStatusBadge` must be aligned with the enum in the backend spec (F03).
- Every page is still a `PlaceholderPage`; replace it with the real implementation per module.
