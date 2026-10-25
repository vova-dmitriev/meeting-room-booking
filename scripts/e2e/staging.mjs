import { spawnSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { assertPlaywrightReport } from "../validation/reports.mjs"
import { cleanEnvironment } from "../validation/snapshot.mjs"
import { assertSelectedE2eFiles, e2eFileFilters, readE2eSelection } from "./selection.mjs"

try {
  const selection = readE2eSelection(process.env.E2E_SELECTION)

  process.stdout.write(`Published Playwright selection: ${selection.mode} (${selection.reason})\n`)

  if (selection.mode === "none") process.exit(0)

  const directory = join(process.cwd(), ".superpowers/validation/reports")
  const report = join(directory, "staging.json")

  mkdirSync(directory, { recursive: true })
  rmSync(report, { force: true })

  const result = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      ...e2eFileFilters(selection),
      "--config",
      "playwright.staging.config.ts",
      "--workers=1",
      "--forbid-only",
      "--fail-on-flaky-tests",
      `--reporter=${process.env.GITHUB_ACTIONS ? "list" : "line"},html,json`,
    ],
    {
      cwd: process.cwd(),
      env: { ...cleanEnvironment(), PLAYWRIGHT_JSON_OUTPUT_FILE: report },
      stdio: "inherit",
    },
  )

  if (result.error || result.status !== 0) throw new Error(`Published Playwright E2E failed (exit ${result.status ?? "unavailable"})`)

  const resultReport = JSON.parse(readFileSync(report, "utf8"))

  assertPlaywrightReport(resultReport)
  assertSelectedE2eFiles(resultReport, selection)
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
}
