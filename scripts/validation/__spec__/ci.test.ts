import { describe, expect, it } from "vitest"
import { ciCommand } from "../ci.mjs"
import { validationCommands } from "../commands.mjs"
import { assertCiResults } from "../ci-results.mjs"

const commandIds = [
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
  "unit",
  "storybook",
  "build-application",
  "build-storybook",
  "e2e",
]

const selection = { version: 1, mode: "all", files: [], reason: "Release validation" }

const results = Object.fromEntries(
  ["impact", "source", "security", "unit", "storybook", "builds", "e2e"].map((name) => [name, { result: "success" }]),
)

const input = (changes = {}, plan = selection, mode = plan.mode) =>
  [JSON.stringify({ ...results, ...changes }), JSON.stringify(plan), mode] as const

describe("visible CI checks", () => {
  it("uses every exact local validation command once across the CI adapters", () => {
    expect(commandIds.map((id) => ciCommand(id))).toEqual(validationCommands)
  })

  it.each(["", "unknown", "__proto__", "constructor"])("rejects unsupported command %j before execution", (id) => {
    expect(() => ciCommand(id)).toThrow()
  })

  it("accepts the complete successful runner matrix", () => {
    expect(() => assertCiResults(...input())).not.toThrow()
  })

  it.each(["impact", "source", "security", "unit", "storybook", "builds", "e2e"])("blocks absent %s job results", (name) => {
    expect(() => assertCiResults(...input({ [name]: undefined }))).toThrow()
  })

  it.each(["failure", "cancelled", "skipped", "unknown"])("blocks required runner result %s", (result) => {
    expect(() => assertCiResults(...input({ source: { result } }))).toThrow()
  })

  it("accepts skipped E2E only for a validated explicit none selection", () => {
    const plan = { ...selection, mode: "none" }

    expect(() => assertCiResults(...input({ e2e: { result: "skipped" } }, plan))).not.toThrow()
  })

  it.each(["failure", "cancelled", "success"])("rejects E2E result %s when selection requires an explicit skip", (result) => {
    expect(() => assertCiResults(...input({ e2e: { result } }, { ...selection, mode: "none" }))).toThrow()
  })

  it("rejects missing selection rather than legitimizing a skipped browser job", () => {
    expect(() => assertCiResults(JSON.stringify(results), "", "none")).toThrow()
  })

  it("rejects contradictory mode output and plan JSON", () => {
    expect(() => assertCiResults(...input({}, selection, "none"))).toThrow()
  })

  it.each(["null", "[]", "{", ""])("rejects malformed result collection %j", (raw) => {
    expect(() => assertCiResults(raw, JSON.stringify(selection), selection.mode)).toThrow()
  })
})
