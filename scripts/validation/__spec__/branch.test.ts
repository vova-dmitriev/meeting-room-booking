import { execFileSync, spawnSync } from "node:child_process"
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const repositories: string[] = []

function fixture(git = true) {
  const root = mkdtempSync(join(tmpdir(), "precommit-branch-"))

  repositories.push(root)
  mkdirSync(join(root, "scripts"))
  cpSync(resolve("scripts/validation"), join(root, "scripts/validation"), { recursive: true })
  writeFileSync(join(root, "scripts/validation/run.mjs"), 'process.stdout.write("Fixture validation ran.\\n")\n')
  writeFileSync(join(root, "value.txt"), "staged content")

  if (git) {
    execFileSync("git", ["init", "--quiet", "--initial-branch=main", root])
    execFileSync("git", ["add", "--all"], { cwd: root })
    writeFileSync(join(root, "value.txt"), "unstaged content")
  }

  return root
}

function validate(root: string, ...args: string[]) {
  return spawnSync(process.execPath, ["scripts/validation/pre-commit.mjs", ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 10000,
  })
}

afterEach(() => {
  repositories.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }))
})

describe("pre-commit branch protection", () => {
  it("blocks main before snapshot checks without changing the index or working copy", () => {
    const root = fixture()
    const index = readFileSync(join(root, ".git/index"))
    const result = validate(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/main/)
    expect(result.stderr).toMatch(/feature branch/i)
    expect(result.stderr).toMatch(/pull request/i)
    expect(result.stdout).not.toContain("Fixture validation ran.")
    expect(readFileSync(join(root, ".git/index"))).toEqual(index)
    expect(readFileSync(join(root, "value.txt"), "utf8")).toBe("unstaged content")
  })

  it.each(["feat/branch-protection", "master"])("validates staged changes on %s before its first commit", (branch) => {
    const root = fixture()

    execFileSync("git", ["switch", "--quiet", "-c", branch], { cwd: root })

    const index = readFileSync(join(root, ".git/index"))
    const result = validate(root)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Fixture validation ran.")
    expect(readFileSync(join(root, ".git/index"))).toEqual(index)
    expect(readFileSync(join(root, "value.txt"), "utf8")).toBe("unstaged content")
  })

  it("blocks main even when a tag makes its short branch name ambiguous", () => {
    const root = fixture()
    const blob = execFileSync("git", ["hash-object", "-w", "value.txt"], { cwd: root }).toString().trim()

    execFileSync("git", ["update-ref", "refs/tags/main", blob], { cwd: root })

    const result = validate(root)

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/direct commits to main/i)
    expect(result.stdout).not.toContain("Fixture validation ran.")
  })

  it("continues working-copy validation on main", () => {
    const result = validate(fixture(), "--check-working-copy")

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Fixture validation ran.")
  })

  it.each(["staged", "working-copy"])("continues %s validation with detached HEAD", (mode) => {
    const root = fixture()

    writeFileSync(join(root, ".git/HEAD"), `${"1".repeat(40)}\n`)

    const result = validate(root, ...(mode === "working-copy" ? ["--check-working-copy"] : []))

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Fixture validation ran.")
  })

  it("continues working-copy validation in Gitless exported snapshots", () => {
    const result = validate(fixture(false), "--check-working-copy")

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Fixture validation ran.")
  })

  it.each(["staged", "working-copy"])("keeps CI-only E2E selection scoped correctly in %s validation", (mode) => {
    const root = fixture()
    const selection = JSON.stringify({ version: 1, mode: "none", files: [], reason: "Documentation" })

    execFileSync("git", ["switch", "--quiet", "-c", "feat/selection-scope"], { cwd: root })

    writeFileSync(
      join(root, "scripts/validation/run.mjs"),
      'process.stdout.write(`Selection: ${process.env.E2E_SELECTION ?? "full"}\\n`)\n',
    )

    execFileSync("git", ["add", "scripts/validation/run.mjs"], { cwd: root })

    const result = spawnSync(
      process.execPath,
      ["scripts/validation/pre-commit.mjs", ...(mode === "working-copy" ? ["--check-working-copy"] : [])],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, E2E_SELECTION: selection },
        timeout: 10000,
      },
    )

    expect(result.status).toBe(0)
    expect(result.stdout).toContain(`Selection: ${mode === "staged" ? "full" : selection}`)
  })
})
