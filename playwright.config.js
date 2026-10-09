import { defineConfig } from "@playwright/test";
const baseURL = `http://127.0.0.1:${process.env.PORT || 5174}`;
export default defineConfig({
  testDir: "./tests/browser",
  workers: 2,
  use: { baseURL, channel: "chrome" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node server.mjs --dev",
    url: baseURL,
    reuseExistingServer: true,
  },
});
