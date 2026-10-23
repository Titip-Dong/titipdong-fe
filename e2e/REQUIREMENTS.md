# Frontend journey test map

Behavioral oracle: `docs/FLOWS.md` sections 3–8 and the matching backend module documents in
`../titipdong-be/docs/features/` (rules), with `openapi/openapi.json` as the field contract.

| ID / source                         | Scenario and expected behavior                                                                                | Test                                    | Status                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| AUTH-01 `FLOWS.md` §2               | Register/login, role landing, protected return path, suspended account, profile edit/password/logout          | `auth.spec.ts`                          | Covered                                                                      |
| TRIP-01 `FLOWS.md` §3               | Jastiper creates a trip and catalog photo; buyer/visitor sees a trip; owner manages it; cursor list continues | `trip.spec.ts`                          | Covered; catalog photo upload/detail and no-photo list fallback are asserted |
| ORDER-01 `FLOWS.md` §4 Request      | Buyer creates an order; successful request navigates to order detail and shows requested state                | `business-flow.spec.ts`                 | Covered                                                                      |
| ORDER-02 `FLOWS.md` §4 Inbox/status | Jastiper approves with price and fee; buyer sees backend total and approved state                             | `business-flow.spec.ts`                 | Covered                                                                      |
| PAY-01 `FLOWS.md` §4 Pay            | Buyer completes checkout using the fake gateway; order becomes paid                                           | `business-flow.spec.ts`                 | Covered                                                                      |
| SHIP-01 `FLOWS.md` §4 Ship/confirm  | Jastiper records courier and tracking; buyer confirms receipt; funds release and wallet reflects API balance  | `business-flow.spec.ts`                 | Covered                                                                      |
| DIS-01 `FLOWS.md` §4 Dispute        | Buyer opens a dispute; buyer/admin exchange messages; admin decides refund; order becomes refunded            | `business-flow.spec.ts`                 | Covered                                                                      |
| DIS-02 `FLOWS.md` §4 Dispute        | Evidence upload and admin release decision                                                                    | `business-flow.spec.ts`                 | Covered                                                                      |
| PAY-02 `FLOWS.md` §5 Wallet/payout  | Jastiper saves account and requests available balance; admin records bank reference and pays request          | `business-flow.spec.ts`                 | Covered                                                                      |
| NOTIF-01 `FLOWS.md` §6              | Notification list renders generated copy and mark-all-read clears unread state                                | `business-flow.spec.ts`                 | Covered                                                                      |
| ADMIN-01 `FLOWS.md` §7              | Dashboard, orders, transactions, users, audit and payout routes render for admin                              | `business-flow.spec.ts`                 | Covered for route/load and payout action                                     |
| ADMIN-02 `FLOWS.md` §7              | Admin suspends/reactivates user through UI and backend rejects suspended login                                | `business-flow.spec.ts`, `auth.spec.ts` | Covered                                                                      |
| SHELL-01 `AGENTS.md` Commands       | Desktop and phone smoke, not-found, and responsive role navigation                                            | `smoke.spec.ts`, `shell.spec.ts`        | Covered                                                                      |

The tests use fresh API-created buyer/jastiper accounts and trips. The payout and dispute administrator flows use the
seeded `admin@titipdong.test` account (`demo12345`). Image upload paths require local Azurite as documented by the
backend setup. All cases are exercised in both Playwright projects (desktop and Pixel 7).
