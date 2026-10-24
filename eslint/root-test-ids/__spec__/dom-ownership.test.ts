import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const rule = "frontend/root-test-ids"
const buttonImport = 'import { Button } from "@/shared/ui/button"'
const surfaceImport = 'import { Surface } from "@/shared/ui/surface"'
const primitiveImport = 'import { Button } from "@/shared/ui/primitives"'
const providerImport = 'import { AppProviders } from "@/_app/composition"'
const idsImport = 'import { RootTestId } from "./eslint/root-test-ids/__spec__/root-test-ids.fixtures"'

async function diagnostics(source: string) {
  const [result] = await new ESLint({ overrideConfig: [{ files: ["**/*.tsx"], rules: { [rule]: "error" } }] }).lintText(source, {
    filePath: "root-contract.tsx",
  })

  return result.messages.filter((message) => message.ruleId === rule)
}

describe("imported DOM ownership", () => {
  it.each([
    `${buttonImport}; export const Sample = () => <Button><span>Action</span></Button>`,
    `${surfaceImport}; export const Sample = () => <Surface><h2>Heading</h2><p>Details</p></Surface>`,
    'import { Surface as Panel } from "@/shared/ui/surface"; export const Sample = () => <Panel><h2>Heading</h2></Panel>',
    'import * as Panels from "@/shared/ui/surface"; export const Sample = () => <Panels.Surface><p>Details</p></Panels.Surface>',
    `${primitiveImport}; export const Sample = () => <Button asChild={false}><span>Action</span></Button>`,
  ])("stops at a source-verified imported DOM boundary: %s", async (source) => {
    expect(await diagnostics(source)).toEqual([])
  })

  it.each([
    `${providerImport}; export const Sample = () => <AppProviders><main /></AppProviders>`,
    'import { Fragment as Wrapper } from "react"; export const Sample = () => <Wrapper><main /></Wrapper>',
    'import { Wrapper } from "unknown-wrapper"; export const Sample = () => <Wrapper><main /></Wrapper>',
    `${primitiveImport}; export const Sample = () => <Button asChild><span>Action</span></Button>`,
    `${primitiveImport}; export const Sample = () => <Button asChild={true}><span>Action</span></Button>`,
    `${primitiveImport}; export const Sample = () => <Button asChild={props.asChild}><span>Action</span></Button>`,
    `${surfaceImport}; export const Sample = () => <Surface.Unknown><main /></Surface.Unknown>`,
  ])("continues through providers, unknown wrappers and asChild composition: %s", async (source) => {
    expect(await diagnostics(source)).toEqual([expect.objectContaining({ messageId: "root" })])
  })

  it("accepts a static physical root behind an imported provider", async () => {
    const source = `${providerImport}; ${idsImport};
export const Sample = () => <AppProviders><main data-testid={RootTestId.Root} /></AppProviders>`

    expect(await diagnostics(source)).toEqual([])
  })

  it("still validates explicit nested ID provenance below an imported DOM boundary", async () => {
    const source = `${surfaceImport}; export const Sample = () => <Surface><p data-testid={props.id} /></Surface>`

    expect(await diagnostics(source)).toEqual([expect.objectContaining({ messageId: "id" })])
  })
})
