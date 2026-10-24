import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const rule = "frontend/test-data-constants"

async function violations(source: string, filePath = "tests/e2e/example.spec.ts") {
  const [result] = await new ESLint().lintText(source, { filePath })

  return result.messages.filter((message) => message.ruleId === rule)
}

describe("test data constants", () => {
  it.each([
    'await expect(created).toContainText("Планирование релиза")',
    'await expect(created).toHaveValue("10:00")',
    'await field.fill("New meeting")',
    "await field.fill(`New ${name}`)",
    'await fillBooking(page, "Планирование релиза")',
    'await helper(page, "2026-11-02")',
    'await helper(page, "10:00")',
    'await expect(field).toHaveText(["First", "Second"])',
  ])("rejects inline UI data: %s", async (source) => {
    expect((await violations(source)).length).toBeGreaterThan(0)
  })

  it("accepts fixture constants and typed translations", async () => {
    const source = [
      'import { Meeting } from "./booking.fixtures"',
      'await field.fill(t("demo.meetings.planning"))',
      "await expect(created).toContainText(Meeting.Title)",
      "await expect(field).toHaveValue(Meeting.Start)",
    ].join("\n")

    expect(await violations(source)).toEqual([])
  })

  it("allows technical strings and test descriptions", async () => {
    const source = [
      'test("создаёт бронь в 10:00", async () => {',
      '  await page.keyboard.press("Escape")',
      '  await expect(field).toHaveAttribute("role", "alert")',
      '  await page.goto("/iframe.html?id=preview--default")',
      '  await field.getAttribute("data-booking-id")',
      "})",
    ].join("\n")

    expect(await violations(source)).toEqual([])
  })

  it("allows named constant declarations", async () => {
    const source = 'const Meeting = { Title: "Планирование релиза", Start: "10:00" } as const'

    expect(await violations(source)).toEqual([])
    expect(await violations(source, "tests/e2e/booking.fixtures.ts")).toEqual([])
  })

  it("also protects colocated specs and deployment smoke tests", async () => {
    const source = 'await expect(field).toHaveValue("10:00")'

    for (const path of ["src/shared/ui/button/__spec__/button.test.ts", "tests/deployment/app.spec.ts"]) {
      expect(await violations(source, path)).toHaveLength(1)
    }
  })
})
