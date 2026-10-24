import { describe, expect, it } from "vitest"
import { bookingForSearch, bookingIdFromSearch } from "../booking-url"

const fixture = {
  Present: "?date=2026-10-23&booking=design",
  Empty: "?booking=",
  Absent: "?date=2026-10-23",
} as const

describe("booking search parameter", () => {
  it("reads the linked booking identity", () => {
    expect(bookingIdFromSearch(fixture.Present)).toBe("design")
  })

  it("ignores empty and absent parameters", () => {
    expect(bookingIdFromSearch(fixture.Empty)).toBeUndefined()
    expect(bookingIdFromSearch(fixture.Absent)).toBeUndefined()
  })
})

const linkedFixture = {
  Search: "?date=2026-11-03&booking=linked",
  CurrentDaySearch: "?booking=linked",
  Now: new Date("2026-11-03T08:30:00+03:00"),
  Elapsed: new Date("2026-11-03T10:30:00+03:00"),
  Booking: { id: "linked", date: "2026-11-03", start: "09:30", end: "10:00", title: "Linked meeting" },
  OtherDate: "2026-11-04",
} as const

describe("linked booking resolution", () => {
  it("waits for the booking data matching the requested date", () => {
    const stale = { ...linkedFixture.Booking, date: linkedFixture.OtherDate }

    expect(bookingForSearch(linkedFixture.Search, [stale], linkedFixture.Now)).toBeUndefined()
    expect(bookingForSearch(linkedFixture.Search, [linkedFixture.Booking], linkedFixture.Now)).toEqual(linkedFixture.Booking)
  })

  it("uses the supplied room clock when the URL omits the date", () => {
    expect(bookingForSearch(linkedFixture.CurrentDaySearch, [linkedFixture.Booking], linkedFixture.Now)).toEqual(linkedFixture.Booking)
  })

  it("keeps elapsed slots read-only", () => {
    expect(bookingForSearch(linkedFixture.Search, [linkedFixture.Booking], linkedFixture.Elapsed)).toBeUndefined()
  })
})
