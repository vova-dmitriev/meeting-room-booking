import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const filePath = "src/shared/ui/button/canonical-fixture.tsx"
const rule = "better-tailwindcss/enforce-canonical-classes"

describe("canonical Tailwind utilities", { timeout: 15_000 }, () => {
  it("rejects border-[14px] as an error", async () => {
    const [result] = await new ESLint().lintText('export const sample = <div className="border-[14px]" />', { filePath })

    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([
      expect.objectContaining({ severity: 2, message: expect.stringContaining("border-14") }),
    ])
  })

  it("autofixes the exact reported arbitrary border width and relints cleanly", async () => {
    const [result] = await new ESLint({ fix: true }).lintText('export const sample = <div className="border-[14px]" />', { filePath })

    expect(result.output).toContain('className="border-14"')
    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("detects cn arguments and cva variants using the normal project configuration", async () => {
    const source = [
      'import { cn } from "@/shared/lib/cn"',
      'import { cva } from "class-variance-authority"',
      'export const merged = cn("border-[14px]")',
      'export const variants = cva("flex", { variants: { tone: { default: "hover:border-[14px]" } } })',
    ].join("\n")

    const [result] = await new ESLint({ fix: true }).lintText(source, { filePath })

    expect(result.output).toContain('cn("border-14")')
    expect(result.output).toContain('default: "hover:border-14"')
    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("accepts canonical utilities and necessary arbitrary values", async () => {
    const source = 'export const sample = <div className="border-14 hover:border-14 bg-panel w-[13ch] grid-cols-[1fr_2fr]" />'
    const [result] = await new ESLint().lintText(source, { filePath })

    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })
})
