import { describe, expect, it } from "vitest"
import { getBookingAvailability } from "@/features/booking-editor/model/availability/availability"
import { availabilityFixture } from "./availability.fixtures"

const { future, elapsed, lastSlot, afterLastSlot, past } = availabilityFixture

describe("booking time availability", () => {
  it("allows future working days from 09:00", () => {
    expect(getBookingAvailability(future.date, future.now)).toEqual(future.expected)
  })

  it("excludes elapsed minutes today, rounding up to the next ten-minute slot", () => {
    expect(getBookingAvailability(elapsed.date, elapsed.now)).toEqual(elapsed.expected)
  })

  it("allows the final 30-minute slot exactly at 17:30", () => {
    expect(getBookingAvailability(lastSlot.date, lastSlot.now)).toEqual(lastSlot.expected)
  })

  it("blocks creation when no minimum-length slot remains today", () => {
    expect(getBookingAvailability(afterLastSlot.date, afterLastSlot.now).unavailable).toBe(true)
  })

  it("blocks past dates using the local calendar date", () => {
    expect(getBookingAvailability(past.date, past.now).unavailable).toBe(true)
  })
})
