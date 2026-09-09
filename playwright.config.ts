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
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
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
    // Seed MUTED settings then rebuild ISR against the test DB (globalSetup also
    // seeds; this second seed covers webServer-before-globalSetup ordering).
    // Node script — do not wrap in `cmd /c` (Playwright already uses shell:true).
    command: "node scripts/e2e-webserver.mjs",
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: e2eDatabaseUrl(),
      STORAGE_ROOT: e2eStorageRoot(),
      PORT: port,
    },
  },
});
