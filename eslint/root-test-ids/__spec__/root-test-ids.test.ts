import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"

const rule = "frontend/root-test-ids"
const fixture = "./eslint/root-test-ids/__spec__/root-test-ids.fixtures"
const imported = `import { RootTestId } from "${fixture}"\n`

async function diagnostics(source: string) {
  const [result] = await new ESLint({ overrideConfig: [{ files: ["**/*.tsx"], rules: { [rule]: "error" } }] }).lintText(source, {
    filePath: "root-contract.tsx",
  })

  return result.messages.filter((message) => message.ruleId === rule)
}

describe("component DOM root test IDs", () => {
  it.each([
    "export function Sample() { return <header /> }",
    "export default function () { return <main /> }",
    "export function Sample({ Comp }) { return <Comp /> }",
    'import { Dialog } from "radix-ui"; export const Sample = () => <Dialog.Root><Dialog.Trigger asChild={false} /></Dialog.Root>',
    "export const Sample = () => <div data-testid={props.id} />",
    'const id = "local"; export const Sample = () => <div data-testid={id} />',
    'const LocalTestId = { Root: "local" }; export const Sample = () => <div data-testid={LocalTestId.Root} />',
    `${imported}export const Sample = () => <div data-testid={RootTestId[props.kind]} />`,
    `${imported}export function Sample(RootTestId) { return <div data-testid={RootTestId.Root} /> }`,
    `import { DynamicTestId } from "${fixture}"; export const Sample = () => <div data-testid={DynamicTestId.Root} />`,
    `import { GetterTestId } from "${fixture}"; export const Sample = () => <div data-testid={GetterTestId.Root} />`,
    `import { FactoryTestId } from "${fixture}"; export const Sample = () => <div data-testid={FactoryTestId()} />`,
  ])("rejects a missing, dynamic, local or shadowed root ID: %s", async (source) => {
    expect(await diagnostics(source)).toHaveLength(1)
  })

  it.each([
    `${imported}export const Sample = (props) => <div data-testid={RootTestId.Root} {...props} />`,
    `import { RootTestId as Ids } from "${fixture}"; export function Sample() { return <main data-testid={Ids.Root} /> }`,
    `import * as Ids from "${fixture}"; export const Sample = () => <div data-testid={Ids.RootTestId.Root} />`,
    `import { RootId } from "${fixture}"; export const Sample = () => <div data-testid={RootId} />`,
    'import { BookingTestId } from "@/entities/booking"; export const Sample = () => <div data-testid={BookingTestId.Card} />',
  ])("accepts verified imported literal members, aliases and namespaces: %s", async (source) => {
    expect(await diagnostics(source)).toEqual([])
  })

  it("checks every physical root across conditional returns, memo and forwardRef", async () => {
    const source = [
      'import { memo, forwardRef } from "react"',
      "export const First = memo(() => <div />)",
      "export const Second = forwardRef((props, ref) => props.visible ? <main ref={ref} /> : <aside />)",
    ].join("\n")

    expect(await diagnostics(source)).toHaveLength(3)
  })

  it("follows fragments, context and headless Radix wrappers to physical roots", async () => {
    const source = [
      'import { Dialog } from "radix-ui"',
      "export const Sample = () => <Context.Provider value={value}><><Dialog.Root><Dialog.Portal>",
      "<Dialog.Overlay /><Dialog.Content><p>Content</p></Dialog.Content>",
      "</Dialog.Portal></Dialog.Root></></Context.Provider>",
    ].join("\n")

    expect(await diagnostics(source)).toHaveLength(2)
  })

  it("accepts provider/composition-only components and asChild headless wrappers", async () => {
    const source = [
      'import { Dialog } from "radix-ui"',
      'import { Button } from "@/shared/ui/button"',
      `${imported}export function Sample({ children }) { return <Context.Provider value={value}>{children}</Context.Provider> }`,
      "export const Composed = () => <Button />",
      "export const Portal = () => <Dialog.Root><Dialog.Trigger asChild><Button /></Dialog.Trigger></Dialog.Root>",
    ].join("\n")

    expect(await diagnostics(source)).toEqual([])
  })

  it("checks a polymorphic DOM alias but permits imported default IDs before prop spreads", async () => {
    const source = [
      'import { Slot } from "radix-ui"',
      imported,
      'export function Missing({ asChild }) { const Comp = asChild ? Slot.Root : "button"; return <Comp /> }',
      'export function Valid({ asChild, ...props }) { const Comp = asChild ? Slot.Root : "button";',
      "return <Comp data-testid={RootTestId.Root} {...props} /> }",
    ].join("\n")

    expect(await diagnostics(source)).toHaveLength(1)
  })

  it("reports render calls it cannot inspect rather than silently skipping their roots", async () => {
    expect(await diagnostics("export function Sample() { return renderContent() }")).toEqual([
      expect.objectContaining({ messageId: "unresolved" }),
    ])
  })

  it.each([
    { source: "export function Sample() { const root = <header />; return root }", count: 1 },
    { source: "export function Sample() { const root = <main data-testid={props.id} />; const alias = root; return alias }", count: 1 },
    { source: "export function Sample() { const root = visible ? <header /> : <footer />; return root }", count: 2 },
    { source: `${imported}export function Sample() { const root = <main data-testid={RootTestId.Root} />; return root }`, count: 0 },
    {
      source: `${imported}const root = <header />; export function Sample() { const root = <main data-testid={RootTestId.Root} />;
const alias = root; return alias }`,
      count: 0,
    },
    { source: "export function Sample() { let root = <main />; root = content; return root }", count: 1 },
    { source: "export function Sample() { const root = renderContent(); return root }", count: 1 },
  ])("resolves scoped JSX initializer aliases and rejects ambiguous rendering: $source", async ({ source, count }) => {
    expect(await diagnostics(source)).toHaveLength(count)
  })

  it("preserves children/null passthrough for headless composition", async () => {
    const source = "export function Provider({ children }) { const content = children; return content } export const Empty = () => null"

    expect(await diagnostics(source)).toEqual([])
  })

  it.each([
    "<Button data-testid={props.id} />",
    '<Button data-testid={"local"} />',
    "<Button data-testid={LocalId} />",
    "<Button data-testid={visible ? RootTestId.Other : getId()} />",
  ])("rejects nested local/dynamic IDs without treating every descendant as a root: %s", async (child) => {
    const source = `${imported}const LocalId = "local";
export function Sample(props) { return <div data-testid={RootTestId.Root}>${child}<span /></div> }`

    expect(await diagnostics(source)).toHaveLength(1)
  })

  it("accepts finite imported ID choices and optional non-root IDs", async () => {
    const source = `${imported}export function Sample({ visible }) {
return <div data-testid={visible ? RootTestId.Root : RootTestId.Other}>
<span data-testid={visible ? RootTestId.Other : undefined} /><span data-testid={visible ? null : RootTestId.Other} />
</div> }`

    expect(await diagnostics(source)).toEqual([])
  })

  it.each(["undefined", "null"])("rejects an optional physical root ID without duplicate attribute reports: %s", async (missing) => {
    const source = `${imported}export const Sample = ({ visible }) => <div data-testid={visible ? RootTestId.Root : ${missing}} />`

    expect(await diagnostics(source)).toEqual([expect.objectContaining({ messageId: "root" })])
  })
})
