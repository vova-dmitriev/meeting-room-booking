import { describe, expect, it } from "vitest"
import { validationCommands } from "../commands.mjs"

describe("mandatory pre-commit checks", () => {
  it("includes every required gate in the isolated snapshot graph", () => {
    expect(validationCommands.map((step: { name: string }) => step.name)).toEqual([
      "security",
      "dependencies",
      "i18n",
      "typecheck",
      "lint",
      "lint:fsd",
      "lint:structure",
      "lint:react",
      "format:check",
      "knip",
      "unit and integration tests",
      "Storybook mobile, tablet and desktop",
      "production build",
      "Storybook build",
      "Playwright E2E",
    ])
  })

  it("orders shared build outputs and dependencies without serializing independent tests", () => {
    const step = (name: string) => validationCommands.find((entry: { name: string }) => entry.name === name)

    expect(step("production build")?.needs).toContain("typecheck")
    expect(step("Playwright E2E")?.needs).toEqual(["production build", "Storybook build"])
    expect(step("unit and integration tests")?.needs).toEqual(["dependencies"])
    expect(step("Storybook mobile, tablet and desktop")?.needs).toEqual(["dependencies"])
  })

  it("uses an isolated runtime wrapper rather than reusing a working-copy Storybook server", () => {
    const step = validationCommands.at(-1)

    expect(step?.args).toEqual(["scripts/validation/runtime.mjs"])
  })
})
