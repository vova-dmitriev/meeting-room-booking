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

// Sharded runs receive a subset of the matrix per job: Playwright splits by file, so a
// shard may cover fewer than all three device projects while their union stays complete.
export function assertPlaywrightReport(report, { requireAllProjects = true } = {}) {
  const cases = playwrightCases(report.suites ?? [])
  const projects = new Set(cases.map((test) => test.projectName))

  const covered = requireAllProjects ? ["mobile", "tablet", "desktop"].every((project) => projects.has(project)) : projects.size > 0

  if (
    cases.length === 0 ||
    !covered ||
    !(report.stats?.expected > 0) ||
    report.stats.unexpected !== 0 ||
    report.stats.skipped !== 0 ||
    report.stats.flaky !== 0 ||
    !Array.isArray(report.errors) ||
    report.errors.length > 0 ||
    cases.some(
      (test) =>
        test.status !== "expected" ||
        test.expectedStatus !== "passed" ||
        !test.results?.length ||
        test.results.some((result) => result.status !== "passed"),
    )
  ) {
    const scope = requireAllProjects
      ? "all three projects must pass without skipped or flaky cases"
      : "each shard must pass without skipped or flaky cases and cover at least one project"

    throw new Error(`Required Playwright matrix incomplete: ${scope}`)
  }
}
