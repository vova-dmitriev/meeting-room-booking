import { spawnSync } from "node:child_process"
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs"
import { createServer } from "node:net"
import { join } from "node:path"
import { cleanEnvironment } from "./snapshot.mjs"
import { assertPlaywrightReport } from "./reports.mjs"
import { assertSelectedE2eFiles, e2eFileFilters, readE2eSelection } from "../e2e/selection.mjs"

const selection = readE2eSelection(process.env.E2E_SELECTION)

process.stdout.write(`Playwright E2E selection: ${selection.mode} (${selection.reason})\n`)

if (selection.mode === "none") process.exit(0)

const probes = [createServer(), createServer()]

await Promise.all(
  probes.map(
    (probe) =>
      new Promise((accept, reject) => {
        probe.once("error", reject)
        probe.listen(0, "127.0.0.1", accept)
      }),
  ),
)

const [port, applicationPort] = probes.map((probe) => probe.address().port)

await Promise.all(probes.map((probe) => new Promise((accept) => probe.close(accept))))

const config = join(process.cwd(), ".validation-playwright.config.ts")
const url = `http://127.0.0.1:${port}`
const applicationUrl = `http://127.0.0.1:${applicationPort}`
const report = join(process.cwd(), ".superpowers/validation/reports/e2e.json")

const webServer = [
  { command: `node scripts/validation/serve-storybook.mjs ${port}`, url, reuseExistingServer: false, timeout: 30000 },
  {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${applicationPort}`,
    url: applicationUrl,
    reuseExistingServer: false,
    timeout: 30000,
  },
]

const source = `import base from "./playwright.config"
const required = ["mobile", "tablet", "desktop"]
if (required.some((name) => !base.projects?.some((project) => project.name === name))) {
  throw new Error("Playwright must cover mobile, tablet and desktop")
}
export default {
  ...base,
  use: { ...base.use, baseURL: ${JSON.stringify(url)} },
  projects: base.projects?.map((project) => ({ ...project, use: { ...project.use, baseURL: ${JSON.stringify(url)} } })),
  webServer: ${JSON.stringify(webServer)},
}
`

try {
  mkdirSync(join(process.cwd(), ".superpowers/validation/reports"), { recursive: true })
  rmSync(report, { force: true })
  writeFileSync(config, source, { flag: "wx" })

  const result = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      ...e2eFileFilters(selection),
      "--config",
      config,
      "--workers=1",
      "--forbid-only",
      "--reporter=line,json",
    ],
    {
      cwd: process.cwd(),
      env: { ...cleanEnvironment(), APPLICATION_TEST_URL: applicationUrl, PLAYWRIGHT_JSON_OUTPUT_FILE: report },
      stdio: "inherit",
    },
  )

  if (result.error || result.status !== 0) {
    throw new Error(`Isolated Playwright E2E failed (exit ${result.status ?? "unavailable"})`)
  }

  const resultReport = JSON.parse(readFileSync(report, "utf8"))

  assertPlaywrightReport(resultReport)
  assertSelectedE2eFiles(resultReport, selection)
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  rmSync(config, { force: true })
}
