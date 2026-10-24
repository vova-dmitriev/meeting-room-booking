import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

const workflow = readFileSync(new URL("../../../.github/workflows/quality.yml", import.meta.url), "utf8")
const deploy = workflow.split("\n  deploy:\n")[1] ?? ""

describe("release workflow contract", () => {
  it("restores the application and Storybook artifacts instead of rebuilding during deployment", () => {
    expect(deploy).toContain("name: application-build")
    expect(deploy).toContain("name: storybook-build")
    expect(deploy).not.toMatch(/npm run build|vercel@65\.2\.0 deploy/)
    expect(deploy).toContain("node scripts/deployment/cli.mjs release")
  })

  it("retains a cleanup path for a cancelled or failed promotion", () => {
    expect(deploy).toContain("if: ${{ failure() || cancelled() }}")
    expect(deploy).toContain("node scripts/deployment/cli.mjs rollback")
  })

  it("retains recovery state even when a cancelled rollback fails", () => {
    expect(deploy).toContain("name: Upload release state, browser reports and failure traces\n        if: ${{ always() }}")
  })

  it("packages deployment output from the main application build without environment files", () => {
    expect(workflow).toContain("node scripts/deployment/build.mjs")
    expect(workflow).toContain(".vercel/output .vercel/project.json")
    expect(workflow).not.toContain('tar -czf "$RUNNER_TEMP/build.tar.gz" .vercel\n')
  })
})
