import { execFileSync } from "node:child_process"
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve } from "node:path"

const generatedDirectories = new Set([
  ".git",
  ".codegraph",
  ".vercel",
  "node_modules",
  ".next",
  "out",
  "dist",
  "coverage",
  "storybook-static",
  "playwright-report",
  "test-results",
  ".superpowers",
])

export function cleanEnvironment() {
  return Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")))
}

export function git(args, root, options = {}) {
  return execFileSync("git", args, { cwd: root, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 128 * 1024 * 1024, ...options })
}

function assertPath(file) {
  if (file.split("/").some((segment) => generatedDirectories.has(segment)) || file.endsWith(".tsbuildinfo")) {
    throw new Error(`Generated path must not be staged: ${file}`)
  }
}

function exportStaged(root, target) {
  const index = git(["ls-files", "--stage", "-z"], root)
  const entries = index.toString().split("\0").filter(Boolean)

  if (entries.length === 0) {
    throw new Error("The index is empty. Stage the complete project before validation.")
  }

  for (const entry of entries) {
    const separator = entry.indexOf("\t")
    const [mode, object, stage] = entry.slice(0, separator).split(" ")
    const file = entry.slice(separator + 1)

    assertPath(file)

    if (stage !== "0" || !["100644", "100755"].includes(mode)) {
      throw new Error(`Unmerged, symlink or submodule path cannot be validated: ${file}`)
    }

    const destination = resolve(target, file)

    if (relative(target, destination).startsWith("..")) {
      throw new Error("Index path escapes the validation directory")
    }

    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, git(["cat-file", "blob", object], root), { mode: mode === "100755" ? 0o700 : 0o600 })
  }

  return index
}

function exportWorkingCopy(root, target) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (generatedDirectories.has(entry.name) || entry.name.endsWith(".tsbuildinfo") || entry.name === ".DS_Store") {
      continue
    }

    const source = join(root, entry.name)
    const destination = join(target, entry.name)

    if (lstatSync(source).isSymbolicLink()) {
      throw new Error(`Symlink cannot be validated: ${entry.name}`)
    }

    if (entry.isDirectory()) {
      mkdirSync(destination)
      exportWorkingCopy(source, destination)
    } else if (entry.isFile()) {
      copyFileSync(source, destination)
    }
  }
}

export async function withSnapshot(root, mode, validate) {
  const temporary = mkdtempSync(join(tmpdir(), "meeting-room-validation-"))
  let originalIndex

  try {
    if (mode === "staged") {
      originalIndex = exportStaged(root, temporary)
    } else if (mode === "working-copy") {
      exportWorkingCopy(root, temporary)
    } else {
      throw new Error("Expected staged or working-copy validation mode")
    }

    const result = await validate(temporary)

    if (originalIndex && !originalIndex.equals(git(["ls-files", "--stage", "-z"], root))) {
      throw new Error("The index changed during validation. Run the checks again for the new staged snapshot.")
    }

    return result
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}
