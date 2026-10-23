import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { git, withSnapshot } from "../validation/snapshot.mjs"
import { runGitleaks } from "./gitleaks.mjs"
import { runSemgrep } from "./semgrep.mjs"
import { verifyRules } from "./rules.mjs"

const mode = process.argv.includes("--staged") ? "staged" : "working-copy"
const temporary = mkdtempSync(join(tmpdir(), "meeting-room-security-"))

try {
  const root = mode === "staged" ? git(["rev-parse", "--show-toplevel"], process.cwd()).toString().trim() : process.cwd()

  await withSnapshot(root, mode, (snapshot) => {
    verifyRules(snapshot)
    runGitleaks(snapshot, temporary)
    runSemgrep(snapshot, temporary)
  })
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
