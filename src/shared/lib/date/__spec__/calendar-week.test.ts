import { describe, expect, it } from "vitest"
import { calendarWeek } from "@/shared/lib/date"
import { calendarWeekFixture } from "./calendar-week.fixtures"

const { crossYear, sunday, invalidDates } = calendarWeekFixture

describe("calendar week", () => {
  it("keeps all seven actual dates across month and year boundaries", () => {
    expect(calendarWeek(crossYear.selected)).toEqual(crossYear.expected)
  })

  it("starts on Monday for a Sunday selection", () => {
    expect(calendarWeek(sunday.selected)).toEqual(sunday.expected)
  })

  it.each(invalidDates)("does not invent days for invalid input %s", (date) => {
    expect(calendarWeek(date)).toEqual([])
  })
})
