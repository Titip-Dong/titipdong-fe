# AGENTS.md — titipdong-fe

Shared context for coding agents (Claude Code, Cursor, Codex, etc.) and team members working on the TITIP DONG frontend.
The full product plan lives in the `titipdong-docs` repo (`PLAN.md`); per-feature specs are in `titipdong-docs/features/<ID>/`.
The backend lives in the sibling `titipdong-be` repo: architecture and scope in `docs/PLAN.md`, per-module rules,
endpoints, and flows in `docs/features/<module>.md`. All backend modules (F01–F08) are done; the OpenAPI spec is the
source of truth for the contract.

## Product

TITIP DONG is an escrow-backed jastip (personal shopper) platform. A **Jastiper** (someone who is traveling) opens a
trip, a **Pembeli** (buyer) asks them to buy items, and the money is held by the platform and only released to the
Jastiper (minus a 5% fee) after the buyer receives the items. For this prototype, registration is simple and an
**Admin** resolves disputes and pays out jastipers; there is no KYC upload or verification. Each user has exactly one
role: `buyer`, `jastiper`, or `admin` (admins are created only from the backend CLI).

Order status: `requested → approved → paid → shipped → delivered → released`, with these exits:

- `rejected`: the jastiper rejects the request.
- `cancelled`: the buyer cancels before paying, or the 24-hour payment window after approval passes.
- `refunded`: the jastiper cancels after payment, or an admin decides a dispute in the buyer's favor.
- `disputed`: the buyer opens a dispute on a shipped order; an admin decides refund or release.
- If the buyer neither confirms receipt nor disputes within 7 days of shipping, the funds are released automatically.

Only the backend (Go, modular monolith) changes order status; background jobs in the API handle the timeouts.

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
- Internal mock payment flow for the prototype; hosting is Azure Static Web Apps (the backend runs on AKS)

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

To run the backend locally, use `make db-up` and then `make seed` in `titipdong-be`. The API is served at
`http://localhost:8080` (interactive docs at `/docs`). The seed creates `buyer@titipdong.test`,
`jastiper@titipdong.test`, and `admin@titipdong.test`, all with the password `demo12345`.

Before calling a task done, run `pnpm format && pnpm lint && pnpm build`. CI (`.github/workflows/ci.yml`) runs the
same checks and also verifies that `src/api/generated/` matches `openapi/openapi.json`.

## Structure

```
docs/FLOWS.md               flows per role and order status, hooks per step, invalidation table
docs/PLAN.md                frontend revamp plan, split into phases
DESIGN.md                   design system: direction, tokens, layout, Titi, components, motion, copy
.claude/skills/             project skills for coding agents (see "Working rules")
openapi/openapi.json        copy of the backend spec (committed)
src/api/client.ts           orval mutator `apiFetch`: base URL, bearer token, auto refresh on 401, ApiError
src/api/generated/          orval output. NEVER edit by hand
src/app/                    App (providers), router.tsx (all routes), guards.tsx (RequireAuth, RequireRole)
src/components/ui/          shadcn components (ours to edit, after discussing with the team)
src/components/layout/      MainLayout, Navbar, BottomNav, navigation.ts (items per role), Footer, PlaceholderPage,
                            NotFoundPage, FullPageLoader
src/components/*.tsx        shared components (DESIGN.md §8): OrderStatusBadge, ProductImage, ProductTile, Receipt,
                            Titi, PageState (EmptyState, ErrorState, ListSkeleton), LoadMore, ConfirmDialog,
                            ImageUploadField, ActionBar, Deadline, EscrowNote
src/features/<module>/      pages/, components/, hooks/, schemas.ts, index.ts (public exports)
src/lib/                    env.ts (env validation), format.ts (formatRupiah, formatDate, formatRelativeTime),
                            utils.ts (cn), api-error.ts (errorMessage, setFieldErrors), pagination.ts
                            (useCursorList), upload.ts (uploadImage), roles.ts (roleHome, roleLabel)
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

The backend also has admin endpoints without a frontend page yet: `/admin/orders` (`listAdminOrders`, F08) and the
payout queue `/admin/payouts` (`listPayouts`, `markPayoutPaid`, `rejectPayout`, F04). Agree on a route and an owner
with the team before adding them.

Only change the module folder you are working on. Changes to `src/components/`, `src/app/`, `src/lib/`,
`src/stores/`, `src/index.css`, and `src/api/client.ts` affect every module: ask the user first.

## Working rules

- **Flow before code.** Before building or redesigning a page, read its flow in `docs/FLOWS.md` and the backend
  feature doc (`../titipdong-be/docs/features/<module>.md`), and write a short flow summary with open questions.
  The backend docs win on rules, `openapi/openapi.json` on fields; fix `docs/FLOWS.md` when it drifts.
- **Design from `DESIGN.md`.** Pages use only its tokens, components, and patterns. A new pattern is added to
  `DESIGN.md` first, after the team agrees.
- **Verify before use.** Confirm a hook, type, component, or helper exists (`grep` `src/api/generated/`,
  `src/components/`, `src/lib/`, the module's `index.ts`) before using it.
- **Evidence over claims.** A task is done only after the checks in "Commands" ran in this session; report failures
  and skipped steps as they are.
- Project skills in `.claude/skills/`: `understand-flow` (before any page or journey), `implement-page` (routes,
  pages, forms, module components), `design-review` (after UI changes), `api-sync` (backend contract changed),
  `finish-and-commit` (definition of done, docs sync, branch and commit format). Use them for those tasks.

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
- Backend endpoints are tagged by module name, so orval output is split per module
  (`@/api/generated/endpoints/<tag>/<tag>.ts`). Exception: every `/admin/*` endpoint has the `admin` tag, including
  dispute decisions (F06) and payouts (F04), so their hooks are in `endpoints/admin/`.
- Need a new endpoint or field: change the backend, run `pnpm api`, and commit `openapi/` + `src/api/generated/`
  together with the FE change that uses it. Never edit `src/api/generated/`.
- Server data goes through TanStack Query only. Zustand is for client state (session, UI preferences); never copy
  API data into Zustand.
- After a mutation, invalidate the related queries (e.g. after approving an order: the request list and order detail).
- Backend errors use RFC 9457 (`application/problem+json`) and are read from `ApiError.body`. The backend `detail`
  is English, so show Indonesian copy per status with `errorMessage()` from `@/lib/api-error`. Status codes: 401 no
  valid token, 403 wrong role, 404 not found or not yours (ownership failures are reported as 404), 409 the order or
  trip is not in a state that allows the action, 422 validation errors (with an `errors` array).
- Lists use cursor pagination: `?limit=` (default 20, max 100) and `?cursor=`; responses carry `items` and
  `nextCursor` (use `useInfiniteQuery` or a "Muat lagi" button).
- Timestamps are RFC 3339 strings; show them with `formatDate()`.
- Notifications are in-app only and the frontend polls: `getUnreadCount` for the bell badge (with
  `refetchInterval`), `listNotifications` for the list. The notification copy is built in the frontend from `type`
  and `data`.

### File uploads

Images (JPEG, PNG, or WebP, at most 5 MB) go from the browser straight to Azure Blob Storage (Azurite locally):

1. `createUpload` (`POST /uploads`) with `purpose`, `contentType`, and `sizeBytes` returns `id`, `uploadUrl`, and
   `uploadHeaders`. The URL expires after 15 minutes.
2. `PUT` the file to `uploadUrl` with plain `fetch` (not `apiFetch`: no bearer token), sending every header in
   `uploadHeaders`.
3. Send the upload `id` to the endpoint that uses it (`photoUploadId` on `createOrder` and catalog items, the proof
   on `shipOrder`, evidence on disputes). Responses carry a read URL that is valid for one hour.

Purposes: `order_photo` (buyer), `trip_item_photo` (jastiper), `shipment_proof` (jastiper), `dispute_evidence`
(buyer, jastiper). The backend returns 422 for a wrong type or size and 503 when storage is not configured.

### Money

- Money from the API is an integer amount of rupiah. Display it with `formatRupiah()` and the `tabular-nums` class.
- Never calculate prices, fees, or totals in the frontend. Final amounts always come from the backend.

### Auth

- The access token is a JWT that lasts 15 minutes. It lives in memory only (`useAuthStore`, no `persist`) and is sent
  as `Authorization: Bearer`. `login`, `register`, and `refreshSession` return `{ accessToken, user }`.
- The refresh token is an opaque HttpOnly cookie (`refresh_token`, `Path=/auth`, `SameSite=Lax`, 30 days) set by the
  backend. It rotates on every `POST /auth/refresh`; reusing a rotated token signs out that session everywhere.
  Requests that need the cookie use `credentials: "include"`.
- `apiFetch` refreshes once on a 401 and retries. Concurrent refreshes share one request (`refreshAccessToken`).
- `main.tsx` calls `refreshAccessToken()` once on app load; the router renders only after `initialized`.
  Do not move this into a `useEffect` (StrictMode runs effects twice).

### Payments (F04)

- Payments use the backend's fake gateway, not Midtrans Snap or a real payment gateway. The buyer starts with
  `checkoutOrder` (`POST /orders/{id}/payments`, which returns the existing pending payment if there is one) and
  completes it with `simulatePayment` (`POST /payments/{id}/simulate`).
- Only the backend changes an order to `paid`. The frontend completes the mock payment UI and refetches the order.
- The jastiper wallet (`getWallet`) returns `balance`, `available` (what can be requested now), `inEscrow`, and
  `pendingPayout`. Jastipers save a bank account
  (`savePayoutAccount`) and request a payout (`requestPayout`); an admin transfers the money outside the system and
  marks the payout paid.

### Environment

- Access env vars only through `env` from `@/lib/env` (validated with Zod). New variables go in `.env.example`,
  `src/lib/env.ts`, and `src/vite-env.d.ts`.
- Every `VITE_*` variable ends up in the public bundle. Never put secrets there (storage credentials or any future
  external-service keys).

## Design and UI

**`DESIGN.md` is the source of truth**; `/styleguide` (`src/components/styleguide/StyleguidePage.tsx`) is its living
version. The essentials:

- **Fun but simple, and flat**: products lead, few colors used boldly, no 3D, gradients, or decorative effects. Fun
  comes from Titi (the shopping-bag mascot), short celebration animations, and warm copy.
- Tokens from `src/index.css` only, never hardcoded colors. Merah (`primary`) for the one primary action per view
  and trust signals, Rambu (`highlight`) for waiting states only, Cap (`destructive`) for errors and disputes.
  Radius stays `0.375rem`.
- Plus Jakarta Sans; money with `formatRupiah()` and `tabular-nums`; order status only through `OrderStatusBadge`;
  order details in `Receipt` (nota titipan).
- Mobile-first with Tailwind's default breakpoints, designed at 360 px and 1280 px; visible focus; AA contrast.
- Casual Indonesian with "kamu"; buttons name the action; the glossary in `DESIGN.md` §11.

## Git conventions

- Branches: `feat/<module>-<description>` or `fix/<module>-<description>`, e.g. `feat/order-request-form`, cut from
  `dev`.
- Commits: Conventional Commits scoped by module, e.g. `feat(order): add request inbox page`, subject line only.
  No AI attribution (`Co-Authored-By`, "Generated with Claude Code"); commits belong to the local git identity.
  Details in `.claude/skills/finish-and-commit/SKILL.md`.
- Finished branches are merged into `dev` directly (no PR), after local checks pass. `dev` is merged into `main` only
  for a release; pushes to `main` deploy to Azure Static Web Apps (`.github/workflows/deploy-static-web-app.yml`).

## Temporary (TODO)

- These pages are still a `PlaceholderPage`: `/notifications` (F07), `/orders/:id/dispute` and `/admin/disputes`
  (F06), and `/admin`, `/admin/transactions`, `/admin/users`, `/admin/audit` (F08). The backend endpoints for all of
  them exist.
- `window.confirm` is still used in `OrderDetailPage`, `MyTripsPage`, and `ShipmentPanel`; switch them to
  `ConfirmDialog` when those pages are rebuilt.
- The deploy workflow builds with a placeholder `VITE_API_URL` (`https://api.titipdong.invalid`) until the backend has
  a public HTTPS Ingress. The frontend and API must then share one parent domain (for example `app.<domain>` and
  `api.<domain>`), because the `SameSite=Lax` refresh cookie is not sent cross-site; otherwise users are signed out
  on every reload.
