import { defineConfig } from "@playwright/test"

const port = Number(process.env.STORYBOOK_VISUAL_PORT ?? 6007)
const externalServer = process.env.STORYBOOK_VISUAL_URL
const baseURL = externalServer ?? `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./tests/e2e/visual",
  outputDir: "test-results/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{platform}{ext}",
  updateSnapshots: "none",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/visual", open: "never" }]],
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 0, threshold: 0 },
  },
  use: {
    baseURL,
    browserName: "chromium",
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
    reducedMotion: "reduce",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "visual-desktop", testMatch: "desktop.spec.ts", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "visual-mobile",
      testMatch: "mobile.spec.ts",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: externalServer
    ? undefined
    : {
        command: `npx --no-install vite preview --host 0.0.0.0 --port ${port} --strictPort --outDir storybook-static`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 30000,
      },
})
