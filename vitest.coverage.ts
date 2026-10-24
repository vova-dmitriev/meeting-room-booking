import type { CoverageV8Options } from "vitest/node"

export function coverageConfig(reportsDirectory: string): CoverageV8Options {
  return {
    provider: "v8",
    reportsDirectory,
    include: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
    exclude: ["**/stories/**", "**/__spec__/**", "**/*.d.ts", "**/*.types.ts", "**/types.ts", "**/test-ids.ts"],
    reporter: ["text-summary", "html", "lcov", "json-summary"],
    reportOnFailure: true,
  }
}
