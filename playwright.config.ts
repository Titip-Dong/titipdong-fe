import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: "list",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    actionTimeout: 15_000,
    timezoneId: "Asia/Jakarta",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? (existsSync(edgePath) ? edgePath : undefined),
    },
  },
});
