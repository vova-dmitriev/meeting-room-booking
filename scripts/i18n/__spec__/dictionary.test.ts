import { describe, expect, it } from "vitest"
import { checkDictionaries, parseDictionary } from "../dictionary.mjs"

describe("dictionary validation", () => {
  it("reads nested TypeScript object literals without executing them", () => {
    expect(parseDictionary('export const ru = { booking: { title: "Встреча {{name}}" } } as const', "ru")).toEqual({
      "booking.title": "Встреча {{name}}",
    })
  })

  it("accepts identical recursive keys and reordered interpolation placeholders", () => {
    expect(checkDictionaries({ ru: { label: "{{name}} {{count}}" }, en: { label: "{{count}} {{name}}" } })).toEqual([])
  })

  it("reports missing and extra leaf keys", () => {
    expect(checkDictionaries({ ru: { "booking.title": "Встреча" }, en: { other: "Other" } })).toEqual([
      "en: missing key booking.title",
      "en: extra key other",
    ])
  })

  it("rejects empty values even with only the canonical locale", () => {
    expect(checkDictionaries({ ru: { empty: "  " } })).toEqual(["ru: empty value at empty"])
  })

  it("rejects renamed, missing and duplicate interpolation placeholders", () => {
    expect(checkDictionaries({ ru: { label: "{{count}}" }, en: { label: "{{total}}" } })).toEqual(["en: interpolation mismatch at label"])
    expect(checkDictionaries({ ru: { label: "{{count}}" }, en: { label: "{{count}} {{count}}" } })).toHaveLength(1)
  })

  it("rejects executable expressions and duplicate keys", () => {
    expect(() => parseDictionary("export const ru = { value: process.env.SECRET }", "ru")).toThrow("literal")
    expect(() => parseDictionary('export const ru = { value: "one", value: "two" }', "ru")).toThrow("duplicate")
  })

  it("rejects non-string leaves, empty objects and missing canonical dictionary", () => {
    expect(() => parseDictionary("export const ru = { value: 1 }", "ru")).toThrow("string")
    expect(() => parseDictionary("export const ru = { value: {} }", "ru")).toThrow("empty object")
    expect(() => checkDictionaries({ en: { value: "one" } })).toThrow("ru")
  })
})
