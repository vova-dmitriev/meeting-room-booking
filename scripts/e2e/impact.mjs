import { execFile } from "node:child_process"
import { createRequire } from "node:module"
import { isAbsolute, relative, resolve } from "node:path"
import { promisify } from "node:util"

const run = promisify(execFile)
const require = createRequire(import.meta.url)
const playwrightCli = require.resolve("@playwright/test/cli")
const plan = (mode, reason, files = []) => ({ version: 1, mode, files, reason })

function impact(file) {
  if (/^(?:public|app|src\/_app|\.storybook)\//.test(file)) return "all"
  if (/\.(?:md|markdown)$/i.test(file)) return "none"
  if (/(?:^|\/)__spec__\//.test(file) || /^tests\/unit\//.test(file)) return "none"
  if (/^(?:eslint|scripts\/(?:i18n|quality|security))\//.test(file)) return "none"
  if (/^vitest\.(?:config|coverage)\.[cm]?[jt]s$/.test(file)) return "none"
  if (/^src\/shared\/(?:.*\/)?(?:theme|clock|i18n|config)(?:[./-]|$)/.test(file)) return "all"
  if (/(?:^|\/)test-ids\.[jt]s$/.test(file)) return "all"
  if (/^src\/.*\.[cm]?[jt]sx?$/.test(file)) return "source"
  if (/^tests\/e2e\/.*\.[cm]?[jt]sx?$/.test(file)) return "test"

  return "all"
}

function collectSpecs(suites, root, reportRoot) {
  return suites.flatMap((suite) => [
    ...(suite.specs ?? []).map((spec) => {
      if (typeof spec.file !== "string") throw new Error("Playwright list report has an invalid spec path")
      const absolute = isAbsolute(spec.file) ? spec.file : resolve(reportRoot, spec.file)
      const file = relative(root, absolute).split("\\").join("/")

      if (!/^tests\/e2e\/(?:[^/]+\/)*[^/]+\.spec\.ts$/.test(file) || file.split("/").some((part) => part === "..")) {
        throw new Error("Playwright list report contains a spec outside tests/e2e")
      }

      return file
    }),
    ...collectSpecs(suite.suites ?? [], root, reportRoot),
  ])
}

export async function createE2ePlan({ root, base }) {
  if (typeof base !== "string" || !/^[a-f\d]{40,64}$/i.test(base)) return plan("all", "No usable base commit")
  const git = (...args) => run("git", args, { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })

  try {
    await git("rev-parse", "--verify", "--end-of-options", `${base}^{commit}`)
  } catch {
    return plan("all", "Base commit is unavailable")
  }

  const [tracked, untracked] = await Promise.all([
    git("diff", "--name-only", "-z", "--no-renames", base, "--"),
    git("ls-files", "--others", "--exclude-standard", "-z"),
  ])

  const changes = [...new Set(`${tracked.stdout}${untracked.stdout}`.split("\0").filter(Boolean))]
  const impacts = changes.map(impact)

  if (impacts.includes("all")) return plan("all", "Global or unclassified browser impact")
  if (impacts.every((value) => value === "none")) return plan("none", "No browser runtime or E2E changes")

  if (impacts.includes("source") && impacts.filter((value) => value !== "none").length > 1) {
    return plan("all", "Multiple runtime/test inputs cannot be proven individually covered")
  }

  let report

  try {
    const { stdout } = await run(process.execPath, [playwrightCli, "test", "--list", "--only-changed", base, "--reporter=json"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      timeout: 120000,
    })

    report = JSON.parse(stdout)
  } catch {
    throw new Error("Unable to compute Playwright dependency impact")
  }

  if (!Array.isArray(report.suites) || !Array.isArray(report.errors) || report.errors.length > 0) {
    throw new Error("Playwright dependency listing is incomplete")
  }

  const files = [...new Set(collectSpecs(report.suites, resolve(root), report.config?.rootDir ?? root))].sort()

  if (files.length > 0) return plan("selected", "Playwright dependency impact", files)
  if (impacts.includes("source")) return plan("all", "Changed runtime code has no static browser dependency")

  return plan("none", "No current E2E specs depend on changed test files")
}
