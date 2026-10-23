import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { runGitleaks } from "../../../scripts/security/gitleaks.mjs"
import { validateReport } from "../../../scripts/security/semgrep.mjs"

const directories: string[] = []

function scannerResult(status: number | null, error?: Error) {
  return { status, error, pid: 0, output: [], stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), signal: null }
}

function directory() {
  const root = mkdtempSync(join(tmpdir(), "scanner-test-"))

  directories.push(root)

  return root
}

afterEach(() => directories.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })))

describe("fail-closed security scanners", () => {
  it("blocks when Gitleaks is unavailable", () => {
    const root = directory()

    expect(() => runGitleaks(root, root, () => scannerResult(null, new Error("not installed")))).toThrow("required")
  })

  it("blocks scanner failure even if a partial report is empty", () => {
    const root = directory()

    expect(() =>
      runGitleaks(root, root, () => {
        writeFileSync(join(root, "gitleaks.json"), "[]")

        return scannerResult(2)
      }),
    ).toThrow("incomplete")
  })

  it("does not include discovered credential values in errors", () => {
    const root = directory()
    const marker = "private fixture marker"

    const run = () =>
      runGitleaks(root, root, () => {
        writeFileSync(join(root, "gitleaks.json"), JSON.stringify([{ RuleID: "fixture", File: "file.txt", StartLine: 1, Secret: marker }]))

        return scannerResult(1)
      })

    expect(run).toThrow("1 finding")

    try {
      run()
    } catch (error) {
      expect(String(error)).not.toContain(marker)
    }
  })

  it("blocks incomplete Semgrep coverage and parse errors", () => {
    expect(() => validateReport({ results: [], errors: [], paths: { scanned: [] } }, ["src/file.ts"])).toThrow("skipped")

    expect(() =>
      validateReport({ results: [], errors: [{ type: "PartialParsing" }], paths: { scanned: ["src/file.ts"] } }, ["src/file.ts"]),
    ).toThrow("incomplete")
  })

  it("blocks Semgrep findings and accepts a complete clean scan", () => {
    expect(() =>
      validateReport(
        { results: [{ check_id: "fixture", path: "src/file.ts", start: { line: 1 } }], errors: [], paths: { scanned: ["src/file.ts"] } },
        ["src/file.ts"],
      ),
    ).toThrow("1 finding")

    expect(() => validateReport({ results: [], errors: [], paths: { scanned: ["src/file.ts"] } }, ["src/file.ts"])).not.toThrow()
  })
})
