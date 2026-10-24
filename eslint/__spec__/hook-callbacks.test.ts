import { ESLint } from "eslint"
import ts from "typescript"
import { describe, expect, it } from "vitest"

const filePath = "src/features/example/model/use-callback.ts"
const rule = "frontend/hook-callback-body"

async function lint(source: string, fix = false) {
  const [result] = await new ESLint({ fix }).lintText(source, { filePath })

  return result
}

describe("React hook callback block bodies", () => {
  it("rejects the concise theme callback as an error", async () => {
    const source = 'import { useCallback } from "react"\nexport const toggle = useCallback(() => setTheme((current) => current), [])'
    const result = await lint(source)

    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([expect.objectContaining({ severity: 2 })])
  })

  it("covers all configured React hooks, imported aliases and namespace members", async () => {
    const hooks = ["useCallback", "useMemo", "useEffect", "useLayoutEffect", "useInsertionEffect", "useState"]

    for (const hook of hooks) {
      const result = await lint(`import { ${hook} as localHook } from "react"\nexport const result = localHook(() => compute(), [])`)

      expect(result.messages.filter((message) => message.ruleId === rule)).toHaveLength(1)
    }

    for (const declaration of ['import React from "react"', 'import * as React from "react"']) {
      const result = await lint(`${declaration}\nexport const result = React["useMemo"](() => compute(), [])`)

      expect(result.messages.filter((message) => message.ruleId === rule)).toHaveLength(1)
    }
  })

  it("keeps Zustand selectors, nested state updaters and unrelated APIs concise", async () => {
    const source = [
      'import { useCallback } from "react"',
      'import { useMemo } from "unrelated-library"',
      "export const useDate = () => useSchedulerStore((state) => state.date)",
      "export const toggle = useCallback(() => { setTheme((current) => current) }, [])",
      "export const unrelated = useMemo(() => compute(), [])",
    ].join("\n")

    const result = await lint(source)

    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("covers later callback arguments of every imported React use hook", async () => {
    const source = [
      'import { useImperativeHandle, useReducer, useSyncExternalStore } from "react"',
      "export const handle = useImperativeHandle(ref, () => ({ focus }), [])",
      "export const state = useReducer(reducer, undefined, () => initial)",
      "export const snapshot = useSyncExternalStore(subscribe, () => current, () => server)",
    ].join("\n")

    const result = await lint(source)
    const fixed = await lint(source, true)

    expect(result.messages.filter((message) => message.ruleId === rule)).toHaveLength(4)
    expect(fixed.fatalErrorCount).toBe(0)
    expect(fixed.output?.match(/return \(/g)).toHaveLength(4)
    expect(fixed.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("does not confuse a shadowed namespace binding with React", async () => {
    const result = await lint('import * as React from "react"\nexport function sample(React) { return React.useMemo(() => 1, []) }')

    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("autofixes callbacks while preserving object and initializer return values", async () => {
    const source = [
      'import { useMemo, useState } from "react"',
      "export const memo = useMemo(() => ({ theme, toggle }), [theme, toggle])",
      "export const state = useState(() => 3)",
    ].join("\n")

    const result = await lint(source, true)
    const file = ts.createSourceFile("fixed.ts", result.output ?? "", ts.ScriptTarget.Latest, true)
    const returns: ts.Expression[] = []

    function visit(node: ts.Node) {
      if (ts.isReturnStatement(node) && node.expression) {
        let value = node.expression

        while (ts.isParenthesizedExpression(value)) value = value.expression
        returns.push(value)
      }

      ts.forEachChild(node, visit)
    }

    visit(file)
    expect(result.fatalErrorCount).toBe(0)
    expect(returns).toHaveLength(2)
    expect(ts.isObjectLiteralExpression(returns[0])).toBe(true)
    expect(returns[1].getText(file)).toBe("3")
    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
    expect((await lint(result.output ?? "")).messages.filter((message) => message.ruleId === rule)).toEqual([])
  })

  it("preserves comments and nested arrow expressions when autofixing", async () => {
    const result = await lint(
      'import { useMemo } from "react"\nexport const value = useMemo(() => // explanation\n() => compute(), [])',
      true,
    )

    expect(result.output).toContain("// explanation")
    expect(result.fatalErrorCount).toBe(0)
    expect(result.output).toContain("return (")
    expect(result.output).toContain("() => compute()")
    expect(result.messages.filter((message) => message.ruleId === rule)).toEqual([])
  })
})
