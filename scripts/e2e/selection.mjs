import { posix, resolve } from "node:path"

export function readE2eSelection(raw) {
  if (raw === undefined) return { version: 1, mode: "all", files: [], reason: "Full validation" }
  const selection = JSON.parse(raw)

  if (
    !selection ||
    selection.version !== 1 ||
    !["all", "selected", "none"].includes(selection.mode) ||
    typeof selection.reason !== "string" ||
    !selection.reason.trim() ||
    !Array.isArray(selection.files) ||
    new Set(selection.files).size !== selection.files.length ||
    (selection.mode === "selected" ? selection.files.length === 0 : selection.files.length !== 0) ||
    selection.files.some(
      (file) =>
        typeof file !== "string" ||
        !file.startsWith("tests/e2e/") ||
        !file.endsWith(".spec.ts") ||
        /[\\\r\n\0]/.test(file) ||
        posix.normalize(file) !== file,
    )
  ) {
    throw new Error("Invalid Playwright E2E selection")
  }

  return selection
}

export function e2eFileFilters(selection) {
  return selection.files.map((file) => `${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
}

export function assertSelectedE2eFiles(report, selection) {
  if (selection.mode !== "selected") return

  function files(suites) {
    return suites.flatMap((suite) => [...(suite.specs ?? []).map((spec) => spec.file), ...files(suite.suites ?? [])])
  }

  const executed = files(report.suites ?? []).map((file) =>
    resolve(report.config?.rootDir ?? process.cwd(), file)
      .split("\\")
      .join("/"),
  )

  const missing = selection.files.filter((file) => !executed.some((entry) => entry === file || entry?.endsWith(`/${file}`)))

  if (missing.length) throw new Error(`Selected Playwright specs did not execute: ${missing.join(", ")}`)
}
