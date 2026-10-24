import { describe, expect, it } from "vitest"
import { dateFromSearch, urlWithDate } from "../date-url"
import { dateUrlFixture as fixture } from "./date-url.fixtures"

describe("schedule URL date", () => {
  it("accepts a real leap day from the query", () => {
    expect(dateFromSearch(fixture.validSearch, fixture.now)).toBe(fixture.selected)
  })

  it.each(fixture.invalidSearches)("falls back to the Moscow day for %s", (search) => {
    expect(dateFromSearch(search, fixture.now)).toBe(fixture.today)
  })

  it("replaces only the date while retaining repeated query values and the hash", () => {
    expect(urlWithDate(fixture.original, fixture.selected)).toBe(fixture.replaced)
  })

  it("adds a missing date while retaining the path, other query values and hash", () => {
    expect(urlWithDate(fixture.missing, fixture.selected)).toBe(fixture.added)
  })
})
