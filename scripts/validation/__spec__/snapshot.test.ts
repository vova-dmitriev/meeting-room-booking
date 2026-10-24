import { execFileSync } from "node:child_process"
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { withSnapshot } from "../snapshot.mjs"

const repositories: string[] = []

function fixture(staged: string, working: string) {
  const root = mkdtempSync(join(tmpdir(), "precommit-test-"))

  repositories.push(root)
  execFileSync("git", ["init", "--quiet", root])
  writeFileSync(join(root, "value.json"), staged)
  writeFileSync(join(root, "unchanged.txt"), "complete staged tree")
  execFileSync("git", ["add", "--all"], { cwd: root })
  writeFileSync(join(root, "value.json"), working)

  return root
}

afterEach(() => {
  repositories.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }))
})

describe("pre-commit staged snapshot", () => {
  it("rejects invalid staged content even when the working copy is valid", async () => {
    const root = fixture("invalid staged", '{"valid":true}')
    const index = execFileSync("git", ["ls-files", "--stage"], { cwd: root }).toString()

    await expect(
      withSnapshot(root, "staged", (snapshot: string) => JSON.parse(readFileSync(join(snapshot, "value.json"), "utf8"))),
    ).rejects.toThrow()

    expect(readFileSync(join(root, "value.json"), "utf8")).toBe('{"valid":true}')
    expect(execFileSync("git", ["ls-files", "--stage"], { cwd: root }).toString()).toBe(index)
  })

  it("accepts a complete valid index despite invalid unstaged and untracked files, with no commits", async () => {
    const root = fixture('{"valid":true}', "invalid unstaged")
    const before = execFileSync("git", ["status", "--porcelain"], { cwd: root }).toString()

    writeFileSync(join(root, "untracked.json"), "invalid untracked")

    await withSnapshot(root, "staged", (snapshot: string) => {
      expect(JSON.parse(readFileSync(join(snapshot, "value.json"), "utf8"))).toEqual({ valid: true })
      expect(readFileSync(join(snapshot, "unchanged.txt"), "utf8")).toBe("complete staged tree")
      expect(() => readFileSync(join(snapshot, "untracked.json"))).toThrow()
    })

    expect(readFileSync(join(root, "value.json"), "utf8")).toBe("invalid unstaged")
    expect(execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: root }).toString()).toBe(before)
    expect(() => execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: root, stdio: "pipe" })).toThrow()
  })

  it("excludes dependency and generated directories in working-copy mode without a Git repository", async () => {
    const root = mkdtempSync(join(tmpdir(), "working-copy-test-"))

    repositories.push(root)
    mkdirSync(join(root, "node_modules"))
    mkdirSync(join(root, ".next"))
    mkdirSync(join(root, ".vercel"))
    writeFileSync(join(root, "node_modules", "secret.txt"), "dependency fixture")
    writeFileSync(join(root, ".next", "secret.txt"), "generated fixture")
    writeFileSync(join(root, ".vercel", "project.json"), "local deployment metadata")
    writeFileSync(join(root, "source.txt"), "source")

    await withSnapshot(root, "working-copy", (snapshot: string) => {
      expect(readFileSync(join(snapshot, "source.txt"), "utf8")).toBe("source")
      expect(() => readFileSync(join(snapshot, "node_modules", "secret.txt"))).toThrow()
      expect(() => readFileSync(join(snapshot, ".next", "secret.txt"))).toThrow()
      expect(() => readFileSync(join(snapshot, ".vercel", "project.json"))).toThrow()
    })
  })

  it.each(["node_modules", ".vercel"])("rejects forced staging of generated %s metadata", async (directory) => {
    const root = fixture('{"valid":true}', '{"valid":true}')

    mkdirSync(join(root, directory))
    writeFileSync(join(root, directory, "unsafe.txt"), "fixture")
    execFileSync("git", ["add", "--force", `${directory}/unsafe.txt`], { cwd: root })

    await expect(withSnapshot(root, "staged", () => undefined)).rejects.toThrow("Generated path")
  })

  it("exports raw blobs and executable modes without honoring archive attributes", async () => {
    const root = fixture('{"valid":true}', '{"valid":true}')

    writeFileSync(join(root, ".gitattributes"), "value.json export-ignore\nexecutable.sh export-subst\n")
    writeFileSync(join(root, "executable.sh"), "#!/bin/sh\n# $Format:%H$\n")
    chmodSync(join(root, "executable.sh"), 0o755)
    execFileSync("git", ["add", "--all"], { cwd: root })

    await withSnapshot(root, "staged", (snapshot: string) => {
      expect(readFileSync(join(snapshot, "value.json"), "utf8")).toBe('{"valid":true}')
      expect(readFileSync(join(snapshot, "executable.sh"), "utf8")).toContain("$Format:%H$")
      expect(statSync(join(snapshot, "executable.sh")).mode & 0o111).not.toBe(0)
    })
  })

  it("blocks symlinks that could read files outside the staged tree", async () => {
    const root = fixture('{"valid":true}', '{"valid":true}')

    symlinkSync("/etc/passwd", join(root, "external.txt"))
    execFileSync("git", ["add", "external.txt"], { cwd: root })

    await expect(withSnapshot(root, "staged", () => undefined)).rejects.toThrow("symlink")
  })

  it("blocks a changed index during validation instead of approving unchecked blobs", async () => {
    const root = fixture('{"valid":true}', "invalid unstaged")

    await expect(withSnapshot(root, "staged", () => execFileSync("git", ["add", "value.json"], { cwd: root }))).rejects.toThrow(
      "index changed",
    )
  })
})
