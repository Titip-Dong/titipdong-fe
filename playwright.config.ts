import { defineConfig, devices } from "@playwright/test";

// End-to-end tests against the local stack: `make db-up && make seed` in ../titipdong-be, then `pnpm e2e`.
// Every test runs on a desktop and a phone viewport.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // The local API, PostgreSQL, and Azurite share one dev machine; six workers overload this stack.
  workers: 2,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "line",
  use: {
    baseURL: "http://localhost:5173",
    locale: "id-ID",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
