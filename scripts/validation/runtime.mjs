import { spawnSync } from "node:child_process"
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs"
import { createServer } from "node:net"
import { join } from "node:path"
import { cleanEnvironment } from "./snapshot.mjs"
import { assertPlaywrightReport } from "./reports.mjs"

const probe = createServer()

await new Promise((accept, reject) => {
  probe.once("error", reject)
  probe.listen(0, "127.0.0.1", accept)
})

const port = probe.address().port

await new Promise((accept) => probe.close(accept))

const config = join(process.cwd(), ".validation-playwright.config.ts")
const url = `http://127.0.0.1:${port}`
const report = join(process.cwd(), ".superpowers/validation/reports/e2e.json")

const source = `import base from "./playwright.config"
const required = ["mobile", "tablet", "desktop"]
if (required.some((name) => !base.projects?.some((project) => project.name === name))) {
  throw new Error("Playwright must cover mobile, tablet and desktop")
}
export default {
  ...base,
  use: { ...base.use, baseURL: ${JSON.stringify(url)} },
  projects: base.projects?.map((project) => ({ ...project, use: { ...project.use, baseURL: ${JSON.stringify(url)} } })),
  webServer: {
    command: "node scripts/validation/serve-storybook.mjs ${port}",
    url: ${JSON.stringify(url)},
    reuseExistingServer: false,
    timeout: 30000,
  },
}
`

try {
  mkdirSync(join(process.cwd(), ".superpowers/validation/reports"), { recursive: true })
  rmSync(report, { force: true })
  writeFileSync(config, source, { flag: "wx" })

  const result = spawnSync(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", "--config", config, "--workers=1", "--forbid-only", "--reporter=line,json"],
    {
      cwd: process.cwd(),
      env: { ...cleanEnvironment(), PLAYWRIGHT_JSON_OUTPUT_FILE: report },
      stdio: "inherit",
    },
  )

  if (result.error || result.status !== 0) {
    throw new Error(`Isolated Playwright E2E failed (exit ${result.status ?? "unavailable"})`)
  }

  assertPlaywrightReport(JSON.parse(readFileSync(report, "utf8")))
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  rmSync(config, { force: true })
}
