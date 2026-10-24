import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

const playwright = import.meta.resolve("@playwright/test")
const testImport = `import { test, expect } from ${JSON.stringify(playwright)}\n`

export const sourceFile = "src/features/booking/model/value.ts"

export const helperFile = "tests/e2e/helpers/value.ts"

export const firstSpec = "tests/e2e/booking.spec.ts"

export const secondSpec = "tests/e2e/rooms.spec.ts"

export const changedValue = "export const value = 2\n"

export const changedHelper = "export const helper = 2\n"

export function createFixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "e2e-impact-")))
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim()

  const write = (path: string, content: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }

  git("init", "--quiet")
  git("config", "user.name", "Planner fixture")
  git("config", "user.email", "planner@example.invalid")
  write(".gitignore", "test-results/\n")
  write("package.json", '{"type":"module"}\n')
  write("playwright.config.ts", 'export default { testDir: "./tests/e2e", projects: [{name:"mobile"}, {name:"desktop"}] }\n')
  write("README.md", "Original documentation\n")
  write(sourceFile, "export const value = 1\n")
  write(helperFile, "export const helper = 1\n")

  write(
    firstSpec,
    `${testImport}import { value } from '../../${sourceFile}'\n` +
      `import { helper } from './helpers/value'\ntest('booking', () => { expect(value + helper).toBe(2) })\n`,
  )

  write(secondSpec, `${testImport}test('rooms', () => { expect(true).toBe(true) })\n`)
  git("add", ".")
  git("-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", "fixture")

  return { root, base: git("rev-parse", "HEAD"), write, git, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}
