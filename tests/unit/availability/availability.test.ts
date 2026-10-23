import { describe, expect, it } from "vitest"
import { getBookingAvailability } from "@/features/booking-editor/model/availability/availability"

describe("booking time availability", () => {
  it("allows future working days from 09:00", () => {
    expect(getBookingAvailability("2026-10-24", new Date("2026-10-23T12:30:00"))).toEqual({
      startMin: "09:00",
      endMin: "09:30",
      unavailable: false,
    })
  })

  it("excludes elapsed minutes today, rounding up to the next ten-minute slot", () => {
    expect(getBookingAvailability("2026-10-23", new Date("2026-10-23T12:30:01"))).toEqual({
      startMin: "12:40",
      endMin: "13:10",
      unavailable: false,
    })
  })

  it("allows the final 30-minute slot exactly at 17:30", () => {
    expect(getBookingAvailability("2026-10-23", new Date("2026-10-23T17:30:00"))).toEqual({
      startMin: "17:30",
      endMin: "18:00",
      unavailable: false,
    })
  })

  it("blocks creation when no minimum-length slot remains today", () => {
    expect(getBookingAvailability("2026-10-23", new Date("2026-10-23T17:30:01")).unavailable).toBe(true)
  })

  it("blocks past dates using the local calendar date", () => {
    expect(getBookingAvailability("2026-10-22", new Date("2026-10-23T00:01:00")).unavailable).toBe(true)
  })
})
