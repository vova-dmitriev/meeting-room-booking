import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"
import { coverageConfig } from "./vitest.coverage.ts"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["**/__spec__/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    coverage: coverageConfig("coverage/unit"),
  },
})
