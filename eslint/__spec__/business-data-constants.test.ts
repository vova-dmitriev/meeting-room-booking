import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const ruleId = "frontend/business-data-constants"
const modelPath = "src/features/booking-editor/model/editor-store.ts"

async function violations(source: string, filePath = modelPath) {
  const [result] = await new ESLint().lintText(source, { filePath })

  expect(result.fatalErrorCount).toBe(0)

  return result.messages.filter((message) => message.ruleId === ruleId)
}

describe("business data constants", () => {
  it("rejects draft defaults inside a store callback despite the outer const", async () => {
    const source = 'export const store = createStore(() => ({ draft: { date, start: "10:00", end: "11:00", title: "" } }))'

    expect(await violations(source)).toHaveLength(3)
  })

  it("rejects HTTP status comparisons in feature logic", async () => {
    expect(await violations("export function conflict(error) { return error.status === 409 }")).toHaveLength(1)
    expect(await violations("export function failed(response) { return 503 === response.status }")).toHaveLength(1)
    expect(await violations("export function conflict(error) { return error.status === HttpStatus.Conflict }")).toHaveLength(1)
    expect(await violations("export function conflict(error) { return error.isConflict }")).toHaveLength(0)

    expect(
      await violations("export function conflict(error) { return error.status === HttpStatus.Conflict }", "src/shared/api/error.ts"),
    ).toHaveLength(0)
  })

  it("rejects unnamed conversion factors and duration arithmetic", async () => {
    expect(await violations("export function minutes(hours) { return hours * 60 }")).toHaveLength(1)
    expect(await violations("export function duration(start) { return start + 30 }")).toHaveLength(1)
  })

  it("does not exempt business numbers within a const call initializer", async () => {
    expect(await violations("export const available = values.filter((value) => value >= 30)")).toHaveLength(1)
  })

  it("allows explicit named constants, objects and arrays with literal data", async () => {
    const source = [
      "export const MinutesPerHour = 60",
      'export const InitialDraft = { start: "10:00", end: "11:00", title: "" } as const',
      "export const DurationOptions = [30, 60, 120] as const",
      "export function minutes(hours) { return hours * MinutesPerHour }",
      "export function draft(start = InitialDraft.start, title = InitialDraft.title, durations = DurationOptions) {}",
    ].join("\n")

    expect(await violations(source)).toHaveLength(0)
  })

  it("keeps domain values inside inline arrays visible to enforcement", async () => {
    expect(await violations("export function options() { return [30, 60, 120] }")).toHaveLength(3)
    expect(await violations('export function dates() { return ["2026-10-23", "2026-10-24"] }')).toHaveLength(2)
  })

  it("rejects literals in scalar and array default parameters", async () => {
    expect(await violations('export function draft(start = "10:00", title = "", duration = 30) {}')).toHaveLength(3)
    expect(await violations("export function options(durations = [30, 60]) {}")).toHaveLength(2)
  })

  it("rejects domain assignments, comparisons and destructured defaults", async () => {
    expect(await violations('export function clear(draft) { draft.title = ""; return draft.title === "" }')).toHaveLength(2)
    expect(await violations('export function draft({ title = "" } = {}) {}')).toHaveLength(1)
  })

  it("rejects inline date and time templates without treating routes as dates", async () => {
    const source = 'export function date() { return new Date("2026-10-23T08:30:00") }\nexport function start() { return `10:00` }'

    expect(await violations(source)).toHaveLength(2)
    expect(await violations('export function path() { return "/bookings/2026-10-23" }')).toHaveLength(0)
  })

  it("allows technical strings, translation keys and markup", async () => {
    const source = [
      'export function response(error) { return error.kind === "network" ? "POST" : "GET" }',
      'export function label() { return t("booking.form.fields.title") }',
      'export function View() { return <div role="status" className="grid gap-3" data-testid={TestId.Root}><Icon size={24} /></div> }',
    ].join("\n")

    expect(await violations(source, "src/_pages/example/ui/example.tsx")).toHaveLength(0)
  })

  it("allows structural zero and unit values while rejecting business JSX props", async () => {
    expect(await violations("export function next(index) { return index < 0 ? -1 : index + 1 }")).toHaveLength(0)

    expect(
      await violations("export function View() { return <Duration minutes={30} /> }", "src/_pages/example/ui/example.tsx"),
    ).toHaveLength(1)
  })

  it("runs on app source and stories while leaving tests to their own policy", async () => {
    expect(await violations("export default function value() { return 409 }", "app/value.ts")).toHaveLength(1)
    expect(await violations("export function value() { return 409 }", "tests/unit/value.test.ts")).toHaveLength(0)
    expect(await violations("export const Demo = { render: () => 409 }", "src/shared/ui/value/value.stories.tsx")).toHaveLength(1)
  })
})
