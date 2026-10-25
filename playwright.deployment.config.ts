import base from "./playwright.config"
import { defineConfig } from "@playwright/test"
import { protectionBypassState } from "./tests/deployment/bypass"

const baseURL = process.env.DEPLOYMENT_URL ?? "http://127.0.0.1"
const bypassState = await protectionBypassState()

export default defineConfig({
  ...base,
  testDir: "./tests/deployment",
  testIgnore: ["**/__spec__/**"],
  globalSetup: "./tests/deployment/setup.ts",
  outputDir: "test-results/deployment",
  use: { ...base.use, baseURL, storageState: bypassState, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: base.projects?.map((project) => ({ ...project, use: { ...project.use, baseURL } })),
  webServer: undefined,
})
