import { defineConfig } from "@playwright/test";
export default defineConfig({
  outputDir: ".taste-skill/pages-test-results",
  testDir: "./tests/deployment",
  workers: 1,
  use: {
    baseURL:
      process.env.PAGES_TEST_URL ?? "http://127.0.0.1:4173/invitation_25years/",
    channel: process.platform === "win32" ? "msedge" : "chromium",
    headless: true,
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: process.env.PAGES_TEST_URL
    ? undefined
    : {
        command:
          "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort --base=/invitation_25years/",
        url: "http://127.0.0.1:4173/invitation_25years/",
        reuseExistingServer: false,
      },
});
