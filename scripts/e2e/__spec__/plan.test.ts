import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { changedHelper, createFixture, firstSpec, helperFile } from "./planner.fixtures"

const cli = fileURLToPath(new URL("../plan.mjs", import.meta.url))
const privateError = "private-value-must-not-be-logged"

describe("E2E planner CLI", () => {
  let fixture: ReturnType<typeof createFixture>

  beforeEach(() => {
    fixture = createFixture()
  })

  afterEach(() => fixture.cleanup())

  function execute(extra: Partial<NodeJS.ProcessEnv> = {}) {
    return spawnSync(process.execPath, [cli], {
      cwd: fixture.root,
      encoding: "utf8",
      env: { ...process.env, E2E_BASE_SHA: fixture.base, GITHUB_OUTPUT: "", ...extra },
    })
  }

  it("prints a JSON plan when no output file is provided", () => {
    const result = execute()

    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({ version: 1, mode: "none", files: [] })
  })

  it("appends an exact JSON selection and mode for GitHub Actions", () => {
    const output = join(fixture.root, ".git", "github-output")

    fixture.write(helperFile, changedHelper)
    const result = execute({ GITHUB_OUTPUT: output })
    const lines = readFileSync(output, "utf8").trim().split("\n")

    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout)).toMatchObject({ mode: "selected", files: [firstSpec] })
    expect(JSON.parse(lines[0].slice("selection=".length))).toMatchObject({ mode: "selected", files: [firstSpec] })
    expect(lines[1]).toBe("mode=selected")
  })

  it("writes a human-readable step summary with the selected files", () => {
    const output = join(fixture.root, ".git", "github-output")
    const summary = join(fixture.root, ".git", "step-summary")

    fixture.write(helperFile, changedHelper)
    const result = execute({ GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary })
    const text = readFileSync(summary, "utf8")

    expect(result.status).toBe(0)
    expect(text).toContain("E2E selection:")
    expect(text).toContain("selected")
    expect(text).toContain(firstSpec)
  })

  it("fails without exposing raw dependency errors", () => {
    fixture.write(helperFile, `throw new Error(${JSON.stringify(privateError)})\nexport const helper = 2\n`)
    const result = execute()

    expect(result.status).toBe(1)
    expect(result.stdout).toBe("")
    expect(result.stderr).not.toContain(privateError)
    expect(result.stderr).toContain("E2E planning failed")
  })

  it("fails when the output file cannot be written", () => {
    const result = execute({ GITHUB_OUTPUT: join(fixture.root, ".git", "missing", "output") })

    expect(result.status).toBe(1)
  })
})
