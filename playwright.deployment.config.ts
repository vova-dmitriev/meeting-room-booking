import base from "./playwright.config"
import { defineConfig } from "@playwright/test"

const baseURL = process.env.DEPLOYMENT_URL ?? "http://127.0.0.1"

export default defineConfig({
  ...base,
  testDir: "./tests/deployment",
  globalSetup: "./tests/deployment/setup.ts",
  outputDir: "test-results/deployment",
  use: { ...base.use, baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: base.projects?.map((project) => ({ ...project, use: { ...project.use, baseURL } })),
  webServer: undefined,
})
