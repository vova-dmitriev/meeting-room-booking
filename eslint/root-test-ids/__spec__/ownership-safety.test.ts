import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ESLint } from "eslint"
import { afterAll, describe, expect, it } from "vitest"
import { ownershipModule } from "./dom-ownership.fixtures"

const rule = "frontend/root-test-ids"
const directory = mkdtempSync(join(tmpdir(), "root-test-ids-ownership-"))
const fixturePath = join(directory, "ownership.tsx")
const ownedComponent = "Repeated"
const transparentComponents = ["Shadowed", "Mutable", "Provider", "Recursive"]

writeFileSync(fixturePath, ownershipModule)
afterAll(() => rmSync(directory, { recursive: true, force: true }))

async function diagnostics(component: string) {
  const source = `import { ${component} as Wrapper } from ${JSON.stringify(fixturePath)};
export const Sample = () => <Wrapper><main /></Wrapper>`

  const [result] = await new ESLint({ overrideConfig: [{ files: ["**/*.tsx"], rules: { [rule]: "error" } }] }).lintText(source, {
    filePath: "root-contract.tsx",
  })

  return result.messages.filter((message) => message.ruleId === rule)
}

describe("conservative imported ownership", () => {
  it("accepts repeated locally owned fragment roots", async () => {
    expect(await diagnostics(ownedComponent)).toEqual([])
  })

  it.each(transparentComponents)("keeps the children of %s visible to root validation", async (component) => {
    expect(await diagnostics(component)).toEqual([expect.objectContaining({ messageId: "root" })])
  })
})
