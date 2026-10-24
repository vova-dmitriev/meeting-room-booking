import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { fileURLToPath } from "node:url"
import { coverageConfig } from "./vitest.coverage.ts"

export default defineConfig({
  test: {
    coverage: coverageConfig("coverage/storybook"),
    projects: [
      {
        plugins: [storybookTest({ configDir: fileURLToPath(new URL("./.storybook", import.meta.url)) })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chrome" } }),
            instances: [
              { browser: "chromium", name: "mobile", viewport: { width: 390, height: 844 } },
              { browser: "chromium", name: "tablet", viewport: { width: 768, height: 1024 } },
              { browser: "chromium", name: "desktop", viewport: { width: 1440, height: 1000 } },
            ],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
})
