import { mkdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { assertVitestReport } from "./reports.mjs"
import { executeCommand } from "./runner.mjs"
import { cleanEnvironment } from "./snapshot.mjs"
import { cancellation } from "./cancellation.mjs"

const suite = process.argv[2]
const directory = join(process.cwd(), ".superpowers/validation/reports")
const projects = suite === "storybook" ? ["mobile", "tablet", "desktop"] : ["unit"]
const control = cancellation()

try {
  if (!["unit", "storybook"].includes(suite)) {
    throw new Error("Expected unit or storybook suite")
  }

  mkdirSync(directory, { recursive: true })

  for (const project of projects) {
    const report = join(directory, `${project}.json`)
    const selection = suite === "storybook" ? ["--config", "vitest.storybook.config.ts", "--project", project] : []

    rmSync(report, { force: true })

    const status = await executeCommand(
      {
        name: `${suite} ${project}`,
        executable: process.execPath,
        args: [
          "node_modules/vitest/vitest.mjs",
          "run",
          ...selection,
          "--maxWorkers=1",
          "--maxConcurrency=1",
          "--allowOnly=false",
          `--fsModuleCachePath=.superpowers/validation/cache/${project}`,
          `--attachmentsDir=.superpowers/validation/attachments/${project}`,
          "--reporter=default",
          "--reporter=json",
          `--outputFile=${report}`,
        ],
      },
      process.cwd(),
      cleanEnvironment(),
      { signal: control.signal },
    )

    if (status !== 0) {
      throw new Error(`${suite} ${project} failed (exit ${status})`)
    }

    assertVitestReport(JSON.parse(readFileSync(report, "utf8")))
  }
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  control.dispose()
}
