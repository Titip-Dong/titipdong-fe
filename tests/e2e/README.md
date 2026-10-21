# Running E2E tests locally

The browser suite exercises the real frontend, Go API, PostgreSQL, and (for
photo uploads) local Azurite. Start the services in separate terminals:

```powershell
# Terminal 1: backend, PostgreSQL, Azurite
cd C:\File\Projects\titipdong\titipdong-be
docker compose up -d --build --wait
docker compose exec api /titipdong-api seed-demo

# Terminal 2: monitoring stack
cd C:\File\Projects\titipdong\titipdong-be\monitoring
docker compose --env-file ..\.env up -d --wait

# Terminal 3: frontend
cd C:\File\Projects\titipdong\titipdong-fe
pnpm dev

# Terminal 4: tests
cd C:\File\Projects\titipdong\titipdong-fe
pnpm install
pnpm test:e2e
```

The suite defaults to `http://localhost:5173` for the frontend, `http://127.0.0.1:8080`
for the API, and the local Grafana/Prometheus stack on ports 3000/9090. It logs in
as the seeded `admin@titipdong.test` account. Override the endpoints or admin
credentials with `E2E_BASE_URL`, `E2E_API_URL`, `E2E_PROMETHEUS_URL`,
`E2E_GRAFANA_URL`, `E2E_ADMIN_EMAIL`, and `E2E_ADMIN_PASSWORD` as needed. Grafana
credentials use `E2E_GRAFANA_USER` and `E2E_GRAFANA_PASSWORD`.

Playwright uses the installed Microsoft Edge executable when present. On another
machine, install a Playwright browser with `pnpm exec playwright install chromium`,
or set `PLAYWRIGHT_EXECUTABLE_PATH` to a compatible Chromium-based browser.

The tests create unique users, trips, uploads, orders, disputes, and ledger rows.
Use a fresh disposable database for a clean run: `docker compose down -v` in the
backend directory deletes all local PostgreSQL and Azurite data.
