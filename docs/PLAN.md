# Frontend revamp plan

Plan for rebuilding the TITIP DONG frontend on top of the finished backend (F01–F08 done). The work is split into
phases that each end in a working, shippable app, so every phase can be reviewed and merged on its own.

Last updated: 2026-10-17.

## 1. Why a revamp

The first version was built while the backend contract was still moving. Now the backend is complete, and the gap is
larger than adding missing pages:

| Area               | Today                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage           | 22 of the 59 operations are used. Unused: profile edit, trip edit/cancel, the whole catalog, the per-trip inbox (`listTripOrders`), uploads, `cancelPaidOrder`, wallet history, payout account and payouts, disputes, notifications, every admin endpoint |
| Placeholder pages  | `/notifications`, `/orders/:id/dispute`, `/admin`, `/admin/transactions`, `/admin/users`, `/admin/audit`, `/admin/disputes`                                                                                                                               |
| Missing pages      | Trip management (edit, catalog), payout queue, admin orders                                                                                                                                                                                               |
| Photos             | No upload flow, so `ProductImage` always shows the fallback. The design direction ("products are the star") cannot be met without it                                                                                                                      |
| Design consistency | Rules live as a short list in `AGENTS.md`; pages pick radii, spacing, and type sizes ad hoc (`rounded-2xl`/`3xl`, `text-3xl`/`4xl`), and destructive actions use `window.confirm`                                                                         |
| Shared mechanics   | Each page solves loading, empty, error, pagination, and 409 handling its own way                                                                                                                                                                          |
| Bundle             | One chunk is above 500 kB after minification                                                                                                                                                                                                              |

The revamp keeps what works: the stack, the module boundaries, the API client and auth flow, the router shape, and
the domain components (`Receipt`, `OrderStatusBadge`, `ProductTile`) as starting points.

## 2. Principles

1. **Flow first.** Before a phase starts, its flows are checked against `docs/FLOWS.md` and the backend feature
   docs. Unclear rules are resolved before code, not during review.
2. **Design system first.** `DESIGN.md` is written and agreed before any page is rebuilt. Pages only use its tokens,
   components, and patterns; a new pattern goes into `DESIGN.md` first.
3. **Contract first.** Only generated hooks and types. A backend gap is raised as a backend change, never patched
   in the frontend.
4. **Vertical slices.** Each phase delivers complete user journeys (screen, data, states, errors), not layers.
5. **Shippable per phase.** `pnpm format && pnpm lint && pnpm build` green, the phase's journeys walked through by
   hand against the local backend with the demo accounts.

## 3. Phases

Each phase lists its goal, scope, and exit criteria. Order matters: phases 1 and 2 unblock everything else; phases
3–8 can partly overlap once phase 2 is merged, as long as each stays inside its modules.

### Phase 0: Groundwork (done)

- API client regenerated from the current backend spec; orval output formatted by Prettier.
- `AGENTS.md` and `README.md` aligned with the backend docs.
- `docs/FLOWS.md` (flows per role and status), this plan, and the project skills in `.claude/skills/`.

### Phase 1: Design system (`DESIGN.md`)

Goal: one written visual and interaction language that every page follows, so the app looks designed rather than
generated.

Status (2026-10-17): steps 1 and 2 done. Step 3 in progress: all six Titi poses drawn, `/styleguide` aligned with
`DESIGN.md` (palette, type scale, radius). Shared components aligned. Still open: team agreement.

1. Discussion with the team: brand direction, references, what "not AI UI" means for TITIP DONG, density, tone.
2. Write `DESIGN.md`:
   - Principles and anti-patterns (what we never do, with examples).
   - Tokens: color roles (brand, status, surfaces), type scale, spacing scale, radii, borders, elevation, motion.
   - Layout: page widths, grids, the app shell per role, responsive breakpoints.
   - Components and when to use each: buttons, forms, lists, tables, receipt, status badge, product tile and
     gallery, empty/loading/error states, dialogs (no `window.confirm`), toasts, countdowns, money.
   - Patterns: list → detail, multi-step forms, destructive confirmation, polling indicators, upload fields.
   - Copy: voice, button verbs, error and empty-state formulas, number/date/money formats.
3. Apply it: tokens in `src/index.css`, base components in `src/components/`, `/styleguide` rebuilt as the living
   version of `DESIGN.md`, Titi's remaining poses (`menunggu`, `khawatir`, `tidur`) drawn and moved to
   `src/components/`.
   - Shared components follow `DESIGN.md` §5 (`Receipt`, `ProductTile` moved to `rounded-xl`). Module pages that
     still use `rounded-2xl`/`rounded-3xl` are fixed when each page is rebuilt in phases 3–8.

Exit: `DESIGN.md` agreed by the team; `/styleguide` shows every token and component; no page work has started yet.

### Phase 2: Foundation

Goal: the shared pieces every module needs, so modules do not each invent their own.

Status (2026-10-17): done, except the admin layout, which moves to phase 8 with the admin pages. Every piece is listed
in `DESIGN.md` §8 and shown in `/styleguide`; the largest chunk is now ~312 kB.

- App shell per role: navbar for visitor / Pembeli / Jastiper, admin layout, mobile navigation.
- Role homes and redirects after login (`docs/FLOWS.md` §2).
- Page states: shared loading, empty, error, and not-found blocks.
- Lists: a cursor pagination pattern on `useInfiniteQuery` (load more), with filters kept in the URL.
- Uploads: one helper and one image field component for `createUpload` → `PUT` → `id`, with type/size checks,
  progress, and retry.
- Errors: `errorMessage()` extended into a consistent 409/422 pattern (field errors from `errors[]`).
- Confirmation dialog for destructive or final actions.
- Notification bell with the polled unread badge (F07 code, shell placement).
- Route-level code splitting reviewed until no chunk exceeds 500 kB.

Exit: a module can build a list page, a detail page, and a form with photos using only shared pieces.

### Phase 3: Auth and profile (F01)

Status (2026-10-17): done. Covered by `e2e/auth.spec.ts` (register, login, suspended, profile edit, password change,
sign-out) on desktop and phone.

- Login and register rebuilt; 403 suspended message; return to `from`.
- Profile with edit (`useUpdateCurrentUser`): name, phone, password change that logs the user out.

Exit: every row of `docs/FLOWS.md` §2 works.

### Phase 4: Trips and catalog (F02)

Status (2026-10-17): done. Backend added `catalogPreview` to the trip lists (titipdong-be `feat/trip-catalog-preview`).
Covered by `e2e/trip.spec.ts` (create trip, catalog with photo upload, list photos and fallback, detail per role,
edit, close, cancel, ownership).

- Landing and browse with real trips, filters (city, dates) in the URL, load more.
- Trip detail with catalog items (photos, reference price), remaining capacity, and the request entry point.
- Jastiper: my trips, create and edit trip, catalog management with photos, close and cancel (409 explained).

Exit: a jastiper can publish a trip with a photo catalog; a visitor can find it and start a request.

### Phase 5: Orders and shipment (F03, F05)

- Request form with optional photo and catalog prefill.
- Order lists for Pembeli and Jastiper, the per-trip inbox with status filters.
- Order detail per `docs/FLOWS.md` §4 status table: approve/reject, cancel, ship with proof photo, confirm receipt,
  auto-release date, jastiper cancel-and-refund (`useCancelPaidOrder`, F04 hook used from the order page).

Exit: the full happy path from request to released works end to end with the demo accounts.

### Phase 6: Payment, wallet, payouts (F04)

- Pay page: checkout, deadline countdown, mock "Bayar sekarang", result.
- Wallet: balance figures, transaction history, payout account, payout request and history.

Exit: a jastiper can withdraw the earnings from phase 5, and an admin can see the request (phase 8).

### Phase 7: Disputes (F06)

- Open dispute with category, description, and evidence photos.
- Dispute thread on the order page: messages and added evidence, for buyer and jastiper.
- Admin: dispute queue, detail, decision (refund or release).

Exit: both decisions work and the order ends in the right status.

### Phase 8: Notifications and admin (F07, F08)

- Notification list with copy and links per type (`docs/FLOWS.md` §6), mark read, mark all read.
- Admin layout per `DESIGN.md` §5 (sidebar from `lg`, sheet menu below), with menu entries for orders and payouts.
- Admin dashboard, orders, transactions, users (suspend/reactivate), audit log, payout queue.

Exit: an admin can run the platform without the database shell.

### Phase 9: Polish and release readiness

- Walk every journey on a phone width and with the keyboard only; fix contrast and focus issues.
- Consistency pass against `DESIGN.md` across all pages.
- Deployment prerequisites from `README.md` (HTTPS API, one parent domain, `VITE_API_URL`, `CORS_ORIGINS`).

Exit: the team signs off the demo script from §5.

## 4. Ownership

Module owners stay as in `AGENTS.md`. Phases 1 and 2 change shared folders (`src/components/`, `src/app/`,
`src/lib/`, `src/index.css`) and need team agreement before merging. In phases 3–8, a phase that crosses modules
(phase 5 uses F04 and F05 components on an F03 page) keeps each module's code in its own folder and exports it through
`index.ts`.

## 5. Demo script (acceptance for the whole revamp)

Run against the local backend after `make seed` (`docs/FLOWS.md` describes each step):

1. Jastiper creates a trip with two catalog items with photos.
2. Pembeli finds the trip, requests one catalog item with a photo.
3. Jastiper approves with a price and fee; Pembeli sees the notification and the total.
4. Pembeli pays through the mock checkout; both see `paid`.
5. Jastiper ships by courier with a tracking number and proof photo.
6. Pembeli confirms receipt; the jastiper's wallet shows the released amount minus 5%.
7. Jastiper saves a bank account and requests a payout; admin marks it paid with a reference.
8. A second order goes to `shipped`, Pembeli opens a dispute with evidence, both sides post messages, admin decides
   refund; the order ends `refunded`.
9. Admin suspends the buyer; the buyer cannot log in again.

## 6. Open questions

- ~~Trip list thumbnails~~: decided. The backend returns `catalogPreview` (first 3 items and the count) on the lists.
- Where admin orders and the payout queue live in the route map (`/admin/orders`, `/admin/payouts`) and who owns them.
- ~~Trip management page~~: decided. `/my-trips/:slug` (actions and catalog) and `/my-trips/:slug/edit`; the inbox
  stays at `/my-trips/:id/requests`.
- ~~Branch flow for the revamp~~: decided 2026-10-17. Each branch merges into `dev` without a PR; `dev` goes to
  `main` for releases.
