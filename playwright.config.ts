import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3001";
export default defineConfig({
 testDir: "./e2e", timeout: 60_000, expect: { timeout: 10_000 },
 fullyParallel: false, workers: 1, forbidOnly: !!process.env.CI, retries: 0,
 reporter: [["list"], ["html", { open: "never", outputFolder: process.env.E2E_REPORT_DIR ? path.join(process.env.E2E_REPORT_DIR, "html") : "playwright-report" }], ["json", { outputFile: process.env.E2E_REPORT_DIR ? path.join(process.env.E2E_REPORT_DIR, "results.json") : "test-results/results.json" }]],
 use: { baseURL, actionTimeout: 10_000, trace: "retain-on-failure", screenshot: "only-on-failure", video: "retain-on-failure" },
 projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chromium", launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE_PATH } } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
  { name: "mobile-chrome", use: { ...devices["Pixel 5"], channel: "chromium", launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE_PATH } } },
 ],
 webServer: process.env.E2E_BASE_URL ? undefined : {
  command: "npm run dev -- --port 3001", url: baseURL,
  reuseExistingServer: !process.env.CI, timeout: 120_000,
 },
});
