import { describe, expect, it } from "vitest"
import { assertPlaywrightReport, assertVitestReport } from "../../../scripts/validation/reports.mjs"

const passing = {
  success: true,
  numTotalTests: 1,
  numPassedTests: 1,
  numFailedTests: 0,
  numPendingTests: 0,
  numTodoTests: 0,
  testResults: [{ assertionResults: [{ status: "passed" }] }],
}

describe("required suite completion", () => {
  it("accepts a complete passing suite", () => {
    expect(() => assertVitestReport(passing)).not.toThrow()
  })

  it("rejects an empty, skipped, todo, failed or incomplete suite", () => {
    for (const invalid of [
      { ...passing, numTotalTests: 0 },
      { ...passing, numPendingTests: 1 },
      { ...passing, numTodoTests: 1 },
      { ...passing, numFailedTests: 1 },
      { ...passing, testResults: [] },
      { ...passing, testResults: [{ assertionResults: [{ status: "pending" }] }] },
    ]) {
      expect(() => assertVitestReport(invalid)).toThrow("incomplete")
    }
  })

  it("requires every Playwright device project and rejects skipped or flaky cases", () => {
    const report = {
      errors: [],
      stats: { expected: 3, unexpected: 0, skipped: 0, flaky: 0 },
      suites: [
        {
          specs: [
            {
              tests: ["mobile", "tablet", "desktop"].map((projectName) => ({
                projectName,
                expectedStatus: "passed",
                status: "expected",
                results: [{ status: "passed" }],
              })),
            },
          ],
        },
      ],
    }

    expect(() => assertPlaywrightReport(report)).not.toThrow()
    expect(() => assertPlaywrightReport({ ...report, stats: { ...report.stats, skipped: 1 } })).toThrow("incomplete")
    expect(() => assertPlaywrightReport({ ...report, stats: { ...report.stats, flaky: 1 } })).toThrow("incomplete")
    report.suites[0].specs[0].tests.pop()
    expect(() => assertPlaywrightReport(report)).toThrow("incomplete")
  })
})
