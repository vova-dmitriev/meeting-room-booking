import { spawnSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { cleanEnvironment } from "../validation/snapshot.mjs"

function executeScanner(command, args, options) {
  const { status, error } = spawnSync(command, args, options)

  return { status, error }
}

export function runGitleaks(root, reports, execute = executeScanner) {
  const report = join(reports, "gitleaks.json")
  const ignore = join(reports, "empty-gitleaks-ignore")

  writeFileSync(ignore, "")

  const result = execute(
    "gitleaks",
    [
      "dir",
      root,
      "--config",
      join(root, ".gitleaks.toml"),
      "--redact=100",
      "--no-banner",
      "--no-color",
      "--ignore-gitleaks-allow",
      "--gitleaks-ignore-path",
      ignore,
      "--report-format",
      "json",
      "--report-path",
      report,
    ],
    { cwd: reports, encoding: "utf8", env: cleanEnvironment(), timeout: 300000 },
  )

  if (result.error) {
    throw new Error("Gitleaks is required and must finish successfully. Secret scan did not run.")
  }

  let findings

  try {
    findings = JSON.parse(readFileSync(report, "utf8"))
  } catch {
    throw new Error("Gitleaks report is missing or invalid. Secret scan incomplete; output suppressed.")
  }

  if (![0, 1].includes(result.status) || !Array.isArray(findings)) {
    throw new Error("Gitleaks scan incomplete; scanner output suppressed.")
  }

  if (result.status !== 0 || findings.length > 0) {
    throw new Error(`Gitleaks blocked ${findings.length} finding(s). Credential values and source suppressed.`)
  }

  process.stdout.write("Gitleaks: complete snapshot passed.\n")
}
