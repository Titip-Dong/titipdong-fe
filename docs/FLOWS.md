# TITIP DONG flows (frontend view)

What each role does, which screen they do it on, which generated hook it calls, and what the screen must show for
each order status. Derived from the backend docs in `titipdong-be/docs/` (last synced 2026-10-17 with backend
`docs/PLAN.md` dated 2026-10-16).

The backend docs are the source of truth for **rules**; `openapi/openapi.json` is the source of truth for **fields**.
When this file disagrees with either, they win: fix this file in the same change and tell the team.

| Backend doc                                  | Read it for                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `titipdong-be/docs/PLAN.md` §2               | Scope decisions (fake gateway, polling, uploads, windows) |
| `titipdong-be/docs/features/README.md`       | Cross-module sequence diagrams                            |
| `titipdong-be/docs/features/auth.md`         | Session, profile, suspension                              |
| `titipdong-be/docs/features/trip.md`         | Trip status, capacity, catalog                            |
| `titipdong-be/docs/features/order.md`        | Order state machine and transitions                       |
| `titipdong-be/docs/features/payment.md`      | Checkout, escrow, wallet, payouts, refunds                |
| `titipdong-be/docs/features/shipment.md`     | Handover, confirm receipt, auto-release                   |
| `titipdong-be/docs/features/dispute.md`      | Dispute, evidence, messages, decision                     |
| `titipdong-be/docs/features/notification.md` | Notification types and their `data`                       |
| `titipdong-be/docs/features/admin.md`        | Back office                                               |

## 1. Roles

One role per user, fixed at registration. Self-registration offers only `buyer` (Pembeli) and `jastiper`; admins are
created from the backend CLI. Frontend guards (`RequireAuth`, `RequireRole`) are UX only.

| Role     | Does                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| Pembeli  | Browses trips, requests items, pays into escrow, confirms receipt, opens disputes    |
| Jastiper | Opens trips with a catalog, approves or rejects requests, ships, withdraws earnings  |
| Admin    | Watches the platform, decides disputes, pays out jastipers, suspends users           |
| Visitor  | Browses trips and trip details without an account; requesting sends them to `/login` |

## 2. Session (F01)

| Step               | Hook / call                                 | Notes                                                                      |
| ------------------ | ------------------------------------------- | -------------------------------------------------------------------------- |
| Register           | `useRegister`                               | Body `{ name, email, password, role }`; 409 email taken, 422 validation    |
| Login              | `useLogin`                                  | 401 wrong email or password (same message), 403 suspended account          |
| Restore on load    | `refreshAccessToken()` in `main.tsx`        | Cookie only; 401 means "not logged in", not an error                       |
| Any 401 during use | `apiFetch`                                  | Refreshes once and retries; a second 401 clears the session                |
| Profile            | `useGetCurrentUser`, `useUpdateCurrentUser` | Name, phone, or password (needs the current password)                      |
| Change password    | `useUpdateCurrentUser`                      | Revokes every refresh token: log the user out and ask them to log in again |
| Logout             | `logout`                                    | Revokes the session family, clears the cookie                              |

After login, send the user back to `state.from`, or to the role's home: Pembeli `/`, Jastiper `/my-trips`, Admin
`/admin`.

## 3. Trip and catalog (F02)

### Trip status

| Status      | Meaning                                   | Who sets it                                                        |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `open`      | Accepting requests                        | Created                                                            |
| `closed`    | No new requests; existing orders continue | Jastiper (`useCloseTrip`) or the job once `requestDeadline` passes |
| `completed` | Trip is over and has no active orders     | Job, after `returnsOn`                                             |
| `cancelled` | Called off before any active order        | Jastiper (`useCancelTrip`); 409 when an active order exists        |

A trip accepts requests only when `acceptsRequests` is true (open, before the deadline, `remainingCapacity > 0`).
Use that field; do not recompute it. Capacity is counted in **items**: an order reserves its `quantity`.

### Screens

| Who      | Screen                            | Hooks                                                                             |
| -------- | --------------------------------- | --------------------------------------------------------------------------------- |
| Anyone   | Browse trips (filter city, dates) | `useListTrips` (cursor: `city`, `from`, `to`, `limit`, `cursor`)                  |
| Anyone   | Trip detail + catalog             | `useGetTrip(slug)` (includes `items` and `remainingCapacity`)                     |
| Jastiper | My trips                          | `useListMyTrips`                                                                  |
| Jastiper | Create trip                       | `useCreateTrip`                                                                   |
| Jastiper | Edit trip (only while `open`)     | `useUpdateTrip`; `capacity` cannot drop below what is reserved                    |
| Jastiper | Catalog (while `open`/`closed`)   | `useListTripItems`, `useCreateTripItem`, `useUpdateTripItem`, `useDeleteTripItem` |
| Jastiper | Close / cancel trip               | `useCloseTrip`, `useCancelTrip`                                                   |

Trip rules worth showing in forms: `returnsOn >= departsOn`; `requestDeadline` in the future and no later than the
end of `returnsOn`; the slug is generated and never changes. Catalog `referencePrice` is only indicative: the final
price is set per order on approval. Catalog photos use upload purpose `trip_item_photo`.

## 4. Order lifecycle (F03, F04, F05, F06)

### State machine

```
requested ── approve (jastiper) ──────────────▶ approved
requested ── reject (jastiper) ───────────────▶ rejected
requested ── cancel (buyer) ──────────────────▶ cancelled
approved  ── pay (buyer, fake gateway) ───────▶ paid
approved  ── cancel (buyer) / 24h unpaid ─────▶ cancelled
paid      ── ship (jastiper) ─────────────────▶ shipped
paid      ── cancel and refund (jastiper) ────▶ refunded
shipped   ── confirm (buyer) / 7 days ────────▶ delivered ──▶ released
shipped   ── open dispute (buyer) ────────────▶ disputed
disputed  ── admin decides release ───────────▶ delivered ──▶ released
disputed  ── admin decides refund ────────────▶ refunded
```

`delivered` → `released` happens in the same transaction, so a user rarely sees `delivered`. Final statuses:
`released`, `refunded`, `rejected`, `cancelled`.

### What each status shows

The order detail page (`/orders/:id`, `useGetOrder`, returns `{ order, events }`) shows the `Receipt` with the
`OrderStatusBadge`, the timeline from `events`, and only the actions below. Decide by comparing the current user's
ID with `order.buyer.id` / `order.jastiper.id`.

| Status                   | Pembeli sees / can do                                                                                                                                          | Jastiper sees / can do                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `requested`              | Waiting for the price; **cancel** (`useCancelOrder`)                                                                                                           | **Approve** with `itemPrice` + `jastipFee` (`useApproveOrder`) or **reject** with a reason (`useRejectOrder`)                                  |
| `approved`               | Total and `paymentDeadline` countdown; **pay** (`/orders/:id/pay`); **cancel**                                                                                 | Waiting for payment                                                                                                                            |
| `paid`                   | Money held in escrow; waiting for handover                                                                                                                     | **Ship** (`useShipOrder`: COD, or courier + tracking number, optional proof photo); **cancel and refund** with a reason (`useCancelPaidOrder`) |
| `shipped`                | Shipment details (`useGetShipment`); **confirm receipt** (`useConfirmReceipt`); **open dispute** (`/orders/:id/dispute`); auto-release date (shipped + 7 days) | Shipment details; waiting for confirmation                                                                                                     |
| `disputed`               | Dispute thread: messages and evidence                                                                                                                          | Dispute thread: messages and evidence                                                                                                          |
| `delivered` / `released` | Done                                                                                                                                                           | Done; the jastiper's share is in the wallet                                                                                                    |
| `refunded`               | Refunded; reason from `statusReason`                                                                                                                           | Refunded                                                                                                                                       |
| `rejected` / `cancelled` | Reason from `statusReason`                                                                                                                                     | Reason from `statusReason`                                                                                                                     |

Never compute prices or fees. `total`, `itemPrice`, `jastipFee`, and `paymentDeadline` are absent until approval.
The approve form may show the backend formula as help text (`total = itemPrice × quantity + jastipFee`), but the
total shown on the receipt always comes from the response.

### Request (Pembeli)

`/trip/:slug/request` → `useCreateOrder(slug, { productName, productUrl?, quantity, notes?, photoUploadId? })`.
409 means the trip stopped accepting requests or lacks capacity: refetch the trip and say so. The photo uses upload
purpose `order_photo`. A catalog item can prefill the product name.

### Inbox (Jastiper)

`/my-trips/:id/requests` → `useListTripOrders(tripId, { status, cursor })`. Another jastiper's trip returns 404.
`useListOrders` returns the caller's orders: as a buyer their own requests, as a jastiper the orders on their trips.

### Pay (Pembeli, F04 fake gateway)

1. `useCheckoutOrder(orderId)` creates the payment, or returns the pending one (201 or 200). 409 once the deadline
   has passed: the backend cancels the order; refetch it and explain.
2. Show the amount and a "Bayar sekarang" button on the mock checkout.
3. `useSimulatePayment(paymentId)` settles it (200, idempotent). Refetch the order: it is now `paid`.

### Ship and confirm (F05)

- Jastiper, `paid` only: `useShipOrder` (`PUT /orders/{id}/shipment`). `courier` needs `courierCode` and
  `trackingNumber`; `cod` needs neither. Proof photo purpose `shipment_proof`. 409 if not `paid` any more.
- Pembeli, `shipped` only: `useConfirmReceipt` moves the order to `delivered` and releases the funds in one step.
  Tell the buyer this is final before they confirm.
- Courier status is not tracked; show the tracking number and let the buyer check the courier's site.

### Dispute (F06)

| Step                        | Who                         | Hook                                                       |
| --------------------------- | --------------------------- | ---------------------------------------------------------- |
| Open (order `shipped`)      | Pembeli                     | `useOpenDispute` `{ category, description, evidence[] }`   |
| Read                        | Order buyer/jastiper, admin | `useGetOrderDispute(orderId)`                              |
| Add evidence (while open)   | Order buyer/jastiper        | `useAddDisputeEvidence` (max 5 files per request)          |
| Post a message (while open) | Order buyer/jastiper, admin | `usePostDisputeMessage`                                    |
| Queue                       | Admin                       | `useListDisputes` (default `open`, oldest first)           |
| Detail                      | Admin                       | `useGetDispute` (order, evidence, messages, timeline)      |
| Decide                      | Admin                       | `useDecideDispute` `{ decision: refund \| release, note }` |

Categories come from the generated `OpenDisputeRequestCategory`. Evidence uses upload purpose `dispute_evidence`.
The decision is all or nothing: `refund` → order `refunded`, `release` → order `delivered` → `released`.

## 5. Wallet and payouts (F04, Jastiper and Admin)

| Field (`useGetWallet`) | Meaning                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `balance`              | Released earnings not yet paid out                         |
| `pendingPayout`        | Requested payouts not yet decided                          |
| `available`            | `balance − pendingPayout`: the most a payout can request   |
| `inEscrow`             | Totals of the jastiper's orders still held, before the fee |

| Step               | Who      | Hook                                                                                                            |
| ------------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| History            | Jastiper | `useListWalletTransactions` (`kind` release or payout, `direction`)                                             |
| Bank account       | Jastiper | `useGetPayoutAccount` (404 until saved), `useSavePayoutAccount`                                                 |
| Request payout     | Jastiper | `useRequestPayout` `{ amount }`: 404 without an account, 409 when one is open or the amount exceeds `available` |
| Payout history     | Jastiper | `useListMyPayouts` (newest first)                                                                               |
| Payout queue       | Admin    | `useListPayouts` (oldest first, filter `status`)                                                                |
| Mark paid / reject | Admin    | `useMarkPayoutPaid` `{ reference }`, `useRejectPayout` `{ reason }`; 409 once decided                           |

The admin transfers the money outside the system, then records the bank reference.

## 6. Notifications (F07)

In-app only, polled. Poll `useGetUnreadCount` for the bell badge (`refetchInterval`, pause while the tab is hidden);
open the list with `useListNotifications`; mark with `useMarkNotificationRead` / `useMarkAllNotificationsRead`. The
copy is written in the frontend from `type` and `data`; every notification links somewhere:

| Type               | Recipient          | Link to                    | `data` for the copy                     |
| ------------------ | ------------------ | -------------------------- | --------------------------------------- |
| `order.requested`  | Jastiper           | `/orders/:orderId`         | `orderCode`, `productName`, `buyerName` |
| `order.approved`   | Pembeli            | `/orders/:orderId`         | `orderCode`, `total`, `paymentDeadline` |
| `order.rejected`   | Pembeli            | `/orders/:orderId`         | `orderCode`, `reason`                   |
| `order.cancelled`  | Pembeli, Jastiper  | `/orders/:orderId`         | `orderCode`, `reason`                   |
| `payment.received` | Pembeli, Jastiper  | `/orders/:orderId`         | `orderCode`, `amount`                   |
| `order.shipped`    | Pembeli            | `/orders/:orderId`         | `orderCode`, `method`, `trackingNumber` |
| `order.released`   | Jastiper           | `/wallet`                  | `orderCode`, `amount` (jastiper share)  |
| `order.refunded`   | Pembeli, Jastiper  | `/orders/:orderId`         | `orderCode`, `amount`                   |
| `dispute.opened`   | Jastiper, admins   | order page / admin dispute | `orderCode`, `category`                 |
| `dispute.message`  | Other participants | order page / admin dispute | `orderCode`                             |
| `dispute.resolved` | Pembeli, Jastiper  | `/orders/:orderId`         | `orderCode`, `decision`                 |
| `payout.paid`      | Jastiper           | `/wallet`                  | `amount`                                |
| `payout.rejected`  | Jastiper           | `/wallet`                  | `amount`, `reason`                      |

Unknown types (added later in the backend) fall back to a generic line and no link.

## 7. Admin (F08, plus F04 and F06 admin endpoints)

All admin hooks are in `@/api/generated/endpoints/admin/admin`.

| Screen       | Hooks                                                                           | Notes                                                                                  |
| ------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Dashboard    | `useGetAdminStats`                                                              | Users, orders by status, GMV, escrow, revenue, payable, open disputes, pending payouts |
| Orders       | `useListAdminOrders`                                                            | Filter `status`, search by code; links to `/orders/:id` (admins can read any order)    |
| Transactions | `useListAdminTransactions`                                                      | Ledger transactions with their entries; filter `kind`                                  |
| Users        | `useListAdminUsers`, `useUpdateAdminUser`                                       | Suspend / reactivate; admins cannot be suspended                                       |
| Audit log    | `useListAuditLogs`                                                              | Filter `targetType`, `targetId`, `actorId`                                             |
| Disputes     | `useListDisputes`, `useGetDispute`, `useDecideDispute`, `usePostDisputeMessage` | See §4 Dispute                                                                         |
| Payouts      | `useListPayouts`, `useMarkPayoutPaid`, `useRejectPayout`                        | See §5                                                                                 |

Suspension takes effect at the next refresh: an access token already issued works for up to 15 minutes.

## 8. Shared mechanics

- **Uploads**: `createUpload` → `PUT uploadUrl` with `uploadHeaders` (plain `fetch`) → send the `id`. Details and
  limits in `AGENTS.md` (File uploads). Read URLs in responses expire after one hour: do not store them.
- **Pagination**: every list returns `{ items, nextCursor }`; pass `cursor` for the next page.
- **Errors**: 401 session, 403 role, 404 missing or not yours, 409 state changed (refetch and explain), 422 input.
  On 409, always invalidate the order or trip so the screen shows the new state.
- **Time windows** (show them, never enforce them in the frontend): payment within 24 hours of approval
  (`paymentDeadline`), auto-release 7 days after shipping, request deadline per trip.
- **After a mutation**, invalidate what it changed:

  | Mutation                                | Invalidate                                                                   |
  | --------------------------------------- | ---------------------------------------------------------------------------- |
  | approve / reject / cancel / cancel-paid | `getOrder(id)`, `listOrders`, `listTripOrders(tripId)`, `getTrip` (capacity) |
  | checkout / simulate                     | `getOrder(id)`, `listOrders`                                                 |
  | ship / confirm receipt                  | `getOrder(id)`, `getShipment(id)`, `listOrders`, `getWallet`                 |
  | open dispute / evidence / message       | `getOrderDispute(orderId)`, `getOrder(id)`                                   |
  | decide dispute                          | `listDisputes`, `getDispute(id)`, `getOrder(orderId)`                        |
  | trip create / update / close / cancel   | `listMyTrips`, `getTrip(slug)`, `listTrips`                                  |
  | catalog item create / update / delete   | `listTripItems(id)`, `getTrip(slug)`                                         |
  | payout account / request                | `getPayoutAccount`, `getWallet`, `listMyPayouts`                             |
  | mark payout paid / rejected             | `listPayouts`, `getAdminStats`                                               |
  | mark notification(s) read               | `getUnreadCount`, `listNotifications`                                        |
