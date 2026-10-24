import { resolve } from "node:path"
import { assertCommitBranch } from "./branch.mjs"
import { cancellation } from "./cancellation.mjs"
import { executeCommand } from "./runner.mjs"
import { cleanEnvironment, git, withSnapshot } from "./snapshot.mjs"

const mode = process.argv.includes("--check-working-copy") ? "working-copy" : "staged"
const [major, minor] = process.versions.node.split(".").map(Number)
const control = cancellation()

try {
  if (major < 22 || (major === 22 && minor < 18)) {
    throw new Error("Validation requires Node.js >=22.18.0")
  }

  const root = mode === "staged" ? git(["rev-parse", "--show-toplevel"], process.cwd()).toString().trim() : resolve(process.cwd())

  if (mode === "staged") {
    assertCommitBranch(root)
  }

  const environment = { ...cleanEnvironment(), CI: "1", NEXT_TELEMETRY_DISABLED: "1", STORYBOOK_DISABLE_TELEMETRY: "1" }

  if (mode === "staged") delete environment.E2E_SELECTION

  await withSnapshot(root, mode, async (snapshot) => {
    process.stdout.write(`Pre-commit: validating the complete ${mode} snapshot in isolation.\n`)

    const status = await executeCommand(
      { name: "snapshot validation", executable: process.execPath, args: ["scripts/validation/run.mjs"] },
      snapshot,
      environment,
      { signal: control.signal, timeoutMs: 2400000 },
    )

    if (status !== 0) {
      throw new Error(`Pre-commit blocked: snapshot checks failed (exit ${status}).`)
    }
  })

  process.stdout.write("Pre-commit: all required checks passed.\n")
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  control.dispose()
}
