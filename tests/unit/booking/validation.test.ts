import { describe, expect, it } from "vitest"
import { validateBooking, parseTime, overlaps } from "@/entities/booking"

const future = "2026-10-24"
const now = new Date("2026-10-23T10:00:30")
const input = { date: future, start: "10:00", end: "11:00", title: "Design review" }
const context = { bookings: [], now }

describe("booking rules", () => {
  it("parses time and rejects malformed input", () => {
    expect(parseTime("09:30")).toBe(570)
    expect(parseTime("25:00")).toBeNull()
  })

  it("allows boundary touching and rejects overlap", () => {
    expect(overlaps(input, { ...input, start: "11:00", end: "12:00" })).toBe(false)
    expect(overlaps(input, { ...input, start: "10:30" })).toBe(true)
  })

  it.each([
    ["09:00", "09:30"],
    ["16:00", "18:00"],
  ])("accepts working boundaries %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context)).toEqual([])
  })

  it.each([
    ["08:59", "10:00"],
    ["17:00", "18:01"],
    ["10:00", "10:29"],
    ["10:00", "12:01"],
    ["11:00", "10:00"],
  ])("rejects invalid interval %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context).length).toBeGreaterThan(0)
  })

  it("excludes current ID from conflict checking", () => {
    const bookings = [{ ...input, id: "existing" }]

    expect(validateBooking(input, { ...context, bookings, excludeId: "existing" })).toEqual([])
    expect(validateBooking(input, { ...context, bookings }).length).toBeGreaterThan(0)
  })

  it("rejects past dates, elapsed seconds and invalid dates", () => {
    for (const date of ["2026-10-22", "2026-10-23", "2026-02-30"])
      expect(validateBooking({ ...input, date }, context).length).toBeGreaterThan(0)
  })
})

describe("ten-minute booking grid", () => {
  it.each([
    ["10:05", "10:35"],
    ["10:00", "10:35"],
  ])("rejects off-grid interval %s-%s", (start, end) => {
    expect(validateBooking({ ...input, start, end }, context)).toEqual(["booking.validation.step"])
  })

  it("accepts a forty-minute booking on the grid", () => {
    expect(validateBooking({ ...input, start: "10:10", end: "10:50" }, context)).toEqual([])
  })
})
