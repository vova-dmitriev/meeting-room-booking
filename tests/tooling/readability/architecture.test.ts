import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

async function messages(source: string, filePath: string) {
  const [result] = await new ESLint().lintText(source, { filePath })

  return result.messages.map((message) => message.message)
}

describe("architecture boundaries", () => {
  it("rejects native controls in feature UI", async () => {
    const result = await messages('export const Control = () => <button type="button" />', "src/features/example/ui/control.tsx")

    expect(result).toContain("Reuse a shared UI primitive for native controls.")
  })

  it("allows native controls in shared UI", async () => {
    const result = await messages('export const Control = () => <button type="button" />', "src/shared/ui/example/control.tsx")

    expect(result).not.toContain("Reuse a shared UI primitive for native controls.")
  })

  it("rejects imperative Zustand consumers", async () => {
    const result = await messages(
      "export const cancel = () => store.setState({ editing: undefined })",
      "src/features/example/model/use-edit.ts",
    )

    expect(result).toContain("Consume Zustand through named hooks in model/selectors.ts.")
  })

  it("rejects hardcoded Russian sample text in stories", async () => {
    const result = await messages('export const Default = { args: { title: "Встреча" } }', "src/shared/ui/example/example.stories.tsx")

    expect(result).toContain("Use typed i18n resources for story sample text.")
  })
})
