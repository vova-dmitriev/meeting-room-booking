import { describe, expect, it } from "vitest"
import { assertSelectedE2eFiles, e2eFileFilters, readE2eSelection } from "../selection.mjs"

const selectedFile = "tests/e2e/bookings/crud.spec.ts"
const selected = { version: 1, mode: "selected", files: [selectedFile], reason: "Related tests" }
const none = { version: 1, mode: "none", files: [], reason: "Documentation only" }
const specialFile = "tests/e2e/bookings/case[1].spec.ts"

describe("Playwright selection transport", () => {
  it("keeps local validation full when no CI selection is supplied", () => {
    expect(readE2eSelection(undefined).mode).toBe("all")
    expect(e2eFileFilters(readE2eSelection(undefined))).toEqual([])
  })

  it("distinguishes an intentional empty selection from missing data", () => {
    expect(readE2eSelection(JSON.stringify(none))).toEqual(none)
    expect(() => readE2eSelection("")).toThrow()
  })

  it("preserves an explicit selected suite", () => {
    expect(readE2eSelection(JSON.stringify(selected))).toEqual(selected)
    expect(e2eFileFilters(selected)).toEqual(["tests/e2e/bookings/crud\\.spec\\.ts$"])
  })

  it("escapes file names as literal end-anchored Playwright filters", () => {
    const plan = readE2eSelection(JSON.stringify({ ...selected, files: [specialFile] }))
    const expression = new RegExp(e2eFileFilters(plan)[0])

    expect(expression.test(`/workspace/${specialFile}`)).toBe(true)
    expect(expression.test("/workspace/tests/e2e/bookings/case1.spec.ts")).toBe(false)
    expect(expression.test(`/workspace/${specialFile}.backup`)).toBe(false)
  })

  it("rejects a partial selected-file report even when another file passed", () => {
    const report = { suites: [{ suites: [{ specs: [{ file: `/snapshot/${selectedFile}` }] }] }] }

    expect(() => assertSelectedE2eFiles(report, selected)).not.toThrow()
    expect(() => assertSelectedE2eFiles(report, { ...selected, files: [selectedFile, specialFile] })).toThrow(/did not execute/)
  })

  it("recognizes Playwright JSON paths relative to the test root", () => {
    const report = {
      config: { rootDir: "/snapshot/tests/e2e" },
      suites: [{ specs: [{ file: "bookings/crud.spec.ts" }] }],
    }

    expect(() => assertSelectedE2eFiles(report, selected)).not.toThrow()
  })

  it.each([
    null,
    [],
    { ...selected, version: 2 },
    { ...selected, mode: "skip" },
    { ...selected, reason: "" },
    { ...selected, files: [] },
    { ...selected, files: [selectedFile, selectedFile] },
    { ...none, files: [selectedFile] },
    { ...selected, mode: "all" },
    { ...selected, files: ["../tests/e2e/crud.spec.ts"] },
    { ...selected, files: ["tests/e2e/../bookings/crud.spec.ts"] },
    { ...selected, files: ["/tests/e2e/crud.spec.ts"] },
    { ...selected, files: ["tests/deployment/deployment.spec.ts"] },
    { ...selected, files: ["tests/e2e/bookings/crud.test.ts"] },
    { ...selected, files: ["tests/e2e/bookings/crud.spec.ts\n"] },
  ])("rejects malformed or unsafe selection instead of silently skipping: %j", (input) => {
    expect(() => readE2eSelection(JSON.stringify(input))).toThrow()
  })
})
