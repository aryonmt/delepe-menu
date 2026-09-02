import { defineConfig } from "@playwright/test";
import { e2eDatabaseUrl, e2eStorageRoot } from "./e2e/env";

try {
  process.loadEnvFile?.(".env");
} catch {
  // optional — CI injects env
}

const port = process.env.E2E_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
    trace: "on-first-retry",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    // Clean `.next` so ISR HTML is generated against the test DATABASE_URL, not a
    // leftover production build that used the dev database.
    command:
      process.platform === "win32"
        ? "cmd /c \"if exist .next rmdir /s /q .next && pnpm build && pnpm start\""
        : "rm -rf .next && pnpm build && pnpm start",
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      ...process.env,
      DATABASE_URL: e2eDatabaseUrl(),
      STORAGE_ROOT: e2eStorageRoot(),
      PORT: port,
    },
  },
});
