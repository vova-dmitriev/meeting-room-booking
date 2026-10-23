import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const source = [
  'const meta = { title: "Test/Button" }',
  "export default meta",
  "type Story = { args?: { disabled?: boolean } }",
  "export const Default: Story = {}",
  "export const Disabled: Story = { args: { disabled: true } }",
].join("\n")

const filePath = "src/shared/ui/button/spacing.stories.tsx"
const rule = "@stylistic/padding-line-between-statements"

describe("logical block spacing", () => {
  it("rejects consecutive exports and TypeScript aliases without blank lines", async () => {
    const eslint = new ESLint()
    const [result] = await eslint.lintText(source, { filePath })

    expect(result.messages.filter((message) => message.ruleId === rule).length).toBeGreaterThanOrEqual(3)
  })

  it("autofixes the actual Storybook declaration pattern", async () => {
    const eslint = new ESLint({ fix: true })
    const [result] = await eslint.lintText(source, { filePath })

    expect(result.output).toContain("export default meta\n\ntype Story")
    expect(result.output).toContain("export const Default: Story = {}\n\nexport const Disabled")
    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })
})
