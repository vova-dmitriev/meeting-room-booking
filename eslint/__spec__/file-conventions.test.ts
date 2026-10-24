import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const rule = "frontend/file-conventions"

async function violations(filePath: string, source = "export const example = {}") {
  const [result] = await new ESLint().lintText(source, { filePath })

  expect(result.fatalErrorCount).toBe(0)

  return result.messages.filter((message) => message.ruleId === rule)
}

describe("story and unit file conventions", () => {
  it.each([
    "src/shared/ui/button/button.stories.tsx",
    "src/_pages/bookings/ui/business-rules/time-rules.stories.tsx",
    "src/shared/ui/button/button.test.ts",
    "src/shared/ui/button/button.spec.tsx",
    "tests/unit/button.test.ts",
    "tests/tooling/rules.test.ts",
  ])("rejects misplaced source: %s", async (path) => {
    expect(await violations(path)).toHaveLength(1)
  })

  it.each([
    "src/shared/ui/button/stories/button.stories.tsx",
    "src/_pages/bookings/ui/stories/business-rules/time-rules.stories.tsx",
    "src/shared/ui/button/__spec__/button.test.tsx",
    "eslint/__spec__/rules.test.ts",
    "tests/e2e/bookings/crud.spec.ts",
    "tests/deployment/deployment.spec.ts",
    "tests/integration/api/client.test.ts",
  ])("accepts the supported placement: %s", async (path) => {
    expect(await violations(path)).toEqual([])
  })

  it.each([
    'import { fixture } from "./stories/scenarios"',
    'export { fixture } from "@/shared/ui/button/stories/scenarios"',
    'export * from "./stories"',
    'export const fixture = import("./stories/scenarios")',
    'import { Default } from "./button.stories"',
  ])("rejects production imports from stories: %s", async (source) => {
    expect(await violations("src/shared/ui/button/button.ts", source)).toHaveLength(1)
  })

  it("allows stories and specs to use story helpers", async () => {
    const source = 'import { fixture } from "./stories/scenarios"'

    expect(await violations("src/shared/ui/button/stories/button.stories.tsx", source)).toEqual([])
    expect(await violations("src/shared/ui/button/__spec__/button.test.ts", source)).toEqual([])
  })

  it("also protects Next.js route adapters from story imports", async () => {
    const source = 'import { fixture } from "@/_pages/bookings/ui/stories/business-rules/scenarios"'

    expect(await violations("app/page.tsx", source)).toHaveLength(1)
  })
})
