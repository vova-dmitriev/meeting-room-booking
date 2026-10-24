import { describe, expect, it } from "vitest"
import { BookingError, validateBooking, parseTime, overlaps } from "@/entities/booking"
import { validationFixture } from "./validation.fixtures"

const { input, context, parsedTime, malformedTime, touchingInterval, overlappingStart } = validationFixture

describe("booking rules", () => {
  it("parses time and rejects malformed input", () => {
    expect(parseTime(parsedTime.input)).toBe(parsedTime.minutes)
    expect(parseTime(malformedTime)).toBeNull()
  })

  it("allows boundary touching and rejects overlap", () => {
    expect(overlaps(input, { ...input, ...touchingInterval })).toBe(false)
    expect(overlaps(input, { ...input, start: overlappingStart })).toBe(true)
  })

  it.each(validationFixture.workingIntervals)("accepts working boundaries %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context)).toEqual([])
  })

  it.each(validationFixture.invalidIntervals)("rejects invalid interval %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context).length).toBeGreaterThan(0)
  })

  it("excludes current ID from conflict checking", () => {
    const bookings = [{ ...input, id: validationFixture.existingId }]

    expect(validateBooking(input, { ...context, bookings, excludeId: validationFixture.existingId })).toEqual([])
    expect(validateBooking(input, { ...context, bookings }).length).toBeGreaterThan(0)
  })

  it("rejects past dates, elapsed seconds and invalid dates", () => {
    for (const date of validationFixture.invalidDates) expect(validateBooking({ ...input, date }, context).length).toBeGreaterThan(0)
  })

  it.each(validationFixture.sameDayBoundaries)("checks a Moscow start against the precise instant $now", ({ now, expected }) => {
    expect(validateBooking(input, { ...context, now: new Date(now) })).toEqual(expected)
  })
})

describe("ten-minute booking grid", () => {
  it.each(validationFixture.offGridIntervals)("rejects off-grid interval %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context)).toEqual([BookingError.Step])
  })

  it("accepts a forty-minute booking on the grid", () => {
    expect(validateBooking({ ...input, ...validationFixture.fortyMinuteInterval }, context)).toEqual([])
  })
})
