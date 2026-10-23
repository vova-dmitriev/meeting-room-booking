export function assertVitestReport(report) {
  const cases = report.testResults?.flatMap((file) => file.assertionResults ?? []) ?? []

  if (
    !report.success ||
    !(report.numTotalTests > 0) ||
    report.numPassedTests !== report.numTotalTests ||
    report.numFailedTests !== 0 ||
    report.numPendingTests !== 0 ||
    report.numTodoTests !== 0 ||
    cases.length !== report.numTotalTests ||
    cases.some((test) => test.status !== "passed")
  ) {
    throw new Error("Required Vitest suite incomplete: failed, empty, skipped or todo cases are forbidden")
  }
}

function playwrightCases(suites) {
  return suites.flatMap((suite) => [...(suite.specs ?? []).flatMap((spec) => spec.tests ?? []), ...playwrightCases(suite.suites ?? [])])
}

export function assertPlaywrightReport(report) {
  const cases = playwrightCases(report.suites ?? [])
  const projects = new Set(cases.map((test) => test.projectName))

  if (
    cases.length === 0 ||
    !(report.stats?.expected > 0) ||
    report.stats.unexpected !== 0 ||
    report.stats.skipped !== 0 ||
    report.stats.flaky !== 0 ||
    !Array.isArray(report.errors) ||
    report.errors.length > 0 ||
    ["mobile", "tablet", "desktop"].some((project) => !projects.has(project)) ||
    cases.some(
      (test) =>
        test.status !== "expected" ||
        test.expectedStatus !== "passed" ||
        !test.results?.length ||
        test.results.some((result) => result.status !== "passed"),
    )
  ) {
    throw new Error("Required Playwright matrix incomplete: all three projects must pass without skipped or flaky cases")
  }
}
