import { spawnSync } from "node:child_process"
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { verifyRules } from "./rules.mjs"

const image = "semgrep/semgrep@sha256:81474464c1f07483ba0682a44787fd93c91397419762a04abe2bafaae396304b"
const sourceExtension = /\.(?:js|jsx|mjs|cjs|ts|tsx)$/
const generatedSource = "public/mockServiceWorker.js"

function sourceFiles(root, prefix = "") {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap((entry) => {
    const file = prefix ? `${prefix}/${entry.name}` : entry.name

    if (entry.name === "node_modules" || entry.name === ".git") {
      return []
    }

    if (entry.isDirectory()) {
      return sourceFiles(root, file)
    }

    if (entry.name === ".semgrepignore" || /\.(?:mts|cts)$/.test(entry.name)) {
      throw new Error(`Semgrep cannot validate this path completely: ${file}`)
    }

    return sourceExtension.test(file) && file !== generatedSource ? [file] : []
  })
}

function requireImage() {
  const probe = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], { encoding: "utf8", timeout: 30000 })

  if (probe.error || probe.status !== 0) {
    throw new Error("Docker is required for the pinned Semgrep scanner. Scan did not run.")
  }

  const present = spawnSync("docker", ["image", "inspect", image], { stdio: "ignore", timeout: 30000 })

  if (present.status === 0) {
    return
  }

  const pull = spawnSync("docker", ["pull", "--quiet", image], { stdio: "ignore", timeout: 600000 })

  if (pull.error || pull.status !== 0) {
    throw new Error(`Pinned Semgrep image unavailable. Pull ${image}; scan did not run.`)
  }
}

export function validateReport(report, expected) {
  if (!Array.isArray(report.results) || !Array.isArray(report.errors) || !Array.isArray(report.paths?.scanned)) {
    throw new Error("Semgrep report incomplete; scanner output suppressed.")
  }

  if (report.errors.length > 0) {
    throw new Error(`Semgrep scan incomplete (${report.errors.length} parse/scanner error(s)); output suppressed.`)
  }

  const scanned = new Set(report.paths.scanned.map((file) => file.replace(/^\.\//, "")))
  const missing = expected.filter((file) => !scanned.has(file))

  if (missing.length > 0) {
    throw new Error(`Semgrep skipped ${missing.length} eligible source file(s). Scan incomplete.`)
  }

  if (report.results.length > 0) {
    const locations = report.results.map((finding) => `${finding.check_id}: ${finding.path}:${finding.start?.line}`).join("\n")

    throw new Error(`Semgrep blocked ${report.results.length} finding(s). Source and values suppressed.\n${locations}`)
  }
}

export function runSemgrep(root, reports) {
  const configs = verifyRules(root)
  const expected = sourceFiles(root)

  requireImage()
  writeFileSync(join(root, ".semgrepignore"), "# No source exclusions; complete snapshot coverage is mandatory.\n")

  const reportDirectory = join(reports, "semgrep")

  mkdirSync(reportDirectory)

  const user = process.getuid ? ["--user", `${process.getuid()}:${process.getgid()}`] : []

  const result = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "--pull=never",
      "--network=none",
      "--cpus=1",
      "--read-only",
      "--tmpfs",
      "/tmp",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges",
      ...user,
      "-e",
      "HOME=/tmp",
      "-v",
      `${root}:/src:ro`,
      "-v",
      `${reportDirectory}:/out`,
      "-w",
      "/src",
      image,
      "semgrep",
      "scan",
      ...configs.flatMap((config) => ["--config", config]),
      "--disable-nosem",
      "--error",
      "--metrics=off",
      "--disable-version-check",
      "--quiet",
      "--no-git-ignore",
      "--timeout=0",
      "--jobs=1",
      "--max-target-bytes=0",
      `--exclude=${generatedSource}`,
      "--json",
      "--output=/out/report.json",
      ".",
    ],
    { encoding: "utf8", timeout: 900000, maxBuffer: 8 * 1024 * 1024 },
  )

  if (result.error || ![0, 1].includes(result.status)) {
    throw new Error(`Semgrep did not complete (exit ${result.status ?? "unavailable"}); scanner output suppressed.`)
  }

  let report

  try {
    report = JSON.parse(readFileSync(join(reportDirectory, "report.json"), "utf8"))
  } catch {
    throw new Error("Semgrep report is missing or invalid. Scan incomplete.")
  }

  validateReport(report, expected)
  process.stdout.write(`Semgrep: ${expected.length} source files passed all pinned High/Critical rules.\n`)
}
