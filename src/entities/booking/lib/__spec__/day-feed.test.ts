import { describe, expect, it } from "vitest"
import { getDayFeed } from "@/entities/booking/lib/day-feed"
import { dayFeedFixture } from "./day-feed.fixtures"

const { date, before, after, meeting } = dayFeedFixture

describe("chronological day feed", () => {
  it("represents a future free day once and selects a valid first hour", () => {
    expect(getDayFeed(date, [], before)).toEqual({
      past: false,
      fullDay: true,
      intervals: dayFeedFixture.fullDayIntervals,
    })
  })

  it("sorts meetings and fills the working day without gaps or zero-length rows", () => {
    const feed = getDayFeed(date, [dayFeedFixture.laterMeeting, dayFeedFixture.nextDayMeeting, meeting], before)

    expect(feed.intervals.map(({ kind, start, end }) => [kind, start, end])).toEqual(dayFeedFixture.chronologicalIntervals)
  })

  it("keeps past meetings visible and disables editing without presenting free time", () => {
    const feed = getDayFeed(date, [meeting], after)

    expect(feed.past).toBe(true)
    expect(feed.fullDay).toBe(false)
    expect(feed.intervals).toEqual(dayFeedFixture.pastIntervals)
    expect(getDayFeed(date, [], after).intervals).toEqual([])
  })

  it.each(dayFeedFixture.roundingCases)("rounds available starts up from $time to $start", ({ time, start, fullDay }) => {
    const feed = getDayFeed(date, [], new Date(`${date}T${time}`))
    const actionable = feed.intervals.filter((interval) => interval.kind === "free" && interval.selection)

    expect(actionable).toHaveLength(1)
    expect(actionable[0]).toMatchObject({ start, selection: { start } })
    expect(feed.fullDay).toBe(fullDay)
  })

  it("shows all-day availability today before the working day begins", () => {
    const feed = getDayFeed(date, [], dayFeedFixture.beforeWorkday)

    expect(feed.fullDay).toBe(true)

    expect(feed.intervals).toEqual(dayFeedFixture.fullDayIntervals)
  })

  it.each(dayFeedFixture.editingCases)("only offers editing before or at a meeting start, at %s", (time, editable) => {
    const feed = getDayFeed(date, [meeting], new Date(`${date}T${time}`))

    expect(feed.intervals.find((interval) => interval.kind === "occupied")).toMatchObject({ editable })
  })

  it("disables elapsed free intervals and ended meetings at the exact boundary", () => {
    const feed = getDayFeed(date, [meeting], dayFeedFixture.meetingEnd)

    expect(feed.intervals[0]).toMatchObject({ kind: "free", elapsed: true, selection: null })
    expect(feed.intervals[1]).toMatchObject({ kind: "occupied", editable: false })
    expect(feed.intervals[2]).toMatchObject({ kind: "free", selection: dayFeedFixture.nextSelection })
  })

  it.each(dayFeedFixture.finalSlotCases)("offers no action shorter than thirty minutes at %s", (time, selection) => {
    const feed = getDayFeed(date, [], new Date(`${date}T${time}`))

    expect(feed.intervals.at(-1)).toMatchObject({ kind: "free", selection })
  })

  it("marks today's day complete at 18:00 without free intervals", () => {
    expect(getDayFeed(date, [], dayFeedFixture.workdayEnd)).toEqual({ past: true, fullDay: false, intervals: [] })
  })

  it("clips occupied rows to the workday and keeps their original booking", () => {
    const early = dayFeedFixture.earlyMeeting

    expect(getDayFeed(date, [early], before).intervals[0]).toMatchObject(dayFeedFixture.clippedEarlyInterval)
  })
})
