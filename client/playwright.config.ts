import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173",
    browserName: "chromium",
    channel: process.env.E2E_BROWSER_CHANNEL,
    screenshot: "only-on-failure",
    trace: "off",
  },
  // Uses the existing API proxy. Never starts, resets or seeds the backend.
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
