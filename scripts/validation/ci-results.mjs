import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { readE2eSelection } from "../e2e/selection.mjs"

const requiredJobs = ["impact", "source", "security", "unit", "storybook", "builds", "e2e"]

export function assertCiResults(raw, rawSelection, mode) {
  if (!rawSelection) throw new Error("The impact job must publish an explicit E2E selection")

  const selection = readE2eSelection(rawSelection)
  const results = JSON.parse(raw)

  if (!results || Array.isArray(results) || typeof results !== "object") throw new Error("CI job results must be an object")
  if (selection.mode !== mode) throw new Error("E2E mode output does not match its validated selection")

  for (const name of requiredJobs) {
    const expected = name === "e2e" && selection.mode === "none" ? "skipped" : "success"
    const actual = results[name]?.result

    if (actual !== expected) throw new Error(`Required CI job ${name}: expected ${expected}, received ${actual ?? "missing"}`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assertCiResults(process.env.CI_RESULTS_JSON, process.env.E2E_SELECTION, process.env.E2E_MODE)
    process.stdout.write("All required independent CI jobs passed.\n")
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}
