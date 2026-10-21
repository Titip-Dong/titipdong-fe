# E2E requirement map

Tests are specification-backed by `titipdong-be/README.md`,
`titipdong-be/docs/features/README.md`, the per-feature files under
`titipdong-be/docs/features/`, and the frontend route/behavior contract in
`AGENTS.md`. The backend feature matrix marks F01–F08 as done; the documented
prototype intentionally uses fake payments, manual payouts, in-app notices,
and courier tracking numbers entered by the jastiper.

| ID      | Source                                                                          | Scenario                                                                                                | Expected behavior                                                                 | Coverage                |
| ------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| FE-01   | Backend `docs/features/auth.md`; frontend `/register`, `/profile`               | Register buyer and jastiper; update jastiper profile                                                    | Authenticated role sessions work and profile changes persist                      | `business-flow.spec.ts` |
| FE-02   | Backend `docs/features/trip.md`; frontend trip routes                           | Create trip with required capacity; edit trip; add catalog item with photo                              | Trip/catalog data saves and appears on public trip detail                         | `business-flow.spec.ts` |
| FE-03   | Backend `docs/features/order.md`; frontend `/trip/:slug/request`, `/orders/:id` | Buyer requests; jastiper approves                                                                       | Order transitions from requested to approved and appears to both parties          | `business-flow.spec.ts` |
| FE-04   | Backend `docs/features/payment.md`; frontend `/orders/:id/pay`, `/wallet`       | Pay through fake gateway; receipt releases escrow; save payout account/request payout; admin marks paid | Payment/order/ledger/payout state is reflected in the UI                          | `business-flow.spec.ts` |
| FE-05   | Backend `docs/features/shipment.md`; frontend order detail                      | Jastiper ships by COD; buyer confirms receipt                                                           | Shipment is visible; order becomes released                                       | `business-flow.spec.ts` |
| FE-06   | Backend `docs/features/dispute.md`; frontend dispute form and admin queue       | Buyer opens dispute; admin chooses refund                                                               | Dispute is visible to admin and resolves as refunded                              | `business-flow.spec.ts` |
| FE-07   | Backend `docs/features/notification.md`; frontend `/notifications`              | Mark notifications read                                                                                 | Read state is reflected in the notification list                                  | `business-flow.spec.ts` |
| FE-08   | Backend `docs/features/admin.md`; frontend `/admin/*`                           | Load dashboard, users, transactions, payouts, dispute queue, audit log                                  | Admin routes load and admin actions persist                                       | `business-flow.spec.ts` |
| AUTH-01 | Frontend `src/app/guards.tsx`                                                   | Guest opens admin route                                                                                 | Visitor is redirected to login                                                    | `business-flow.spec.ts` |
| OBS-01  | Backend `docs/PLAN.md` observability; `monitoring/compose.yaml`                 | Scrape API metrics; inspect configured Grafana datasources/dashboard and Loki labels                    | API target is `up`; Grafana has Prometheus/Loki; API service log label is present | `business-flow.spec.ts` |

## Coverage limits

- The browser journey uses the local fake gateway and local Azurite. It does
  not exercise Midtrans, real bank transfer, or a courier tracking provider.
- The journey uploads trip-catalog and order photos. It does not cover every
  upload purpose, file-size/media-type boundary, or expired SAS URL.
- Admin user and audit routes are loaded, but user suspension/filtering and
  every ledger/audit filter combination are not exhaustively checked.
- Unit and integration tests under `titipdong-be/internal/**` remain a
  separate backend suite; run `go test ./...` in the backend repository.
- Tests create uniquely named users, trips, orders, and ledger rows in the
  configured local database and do not delete them afterward. Use a disposable
  local database for repeated or CI runs.
