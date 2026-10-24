import type { Booking } from "../model/types"
import { BookingRule } from "../config/booking-values"
import { parseTime } from "./time"
import type { DayFeedModel, FreeInterval } from "./day-feed.types"
import { formatMinutes } from "@/shared/lib/time"
import { roomTime } from "@/shared/lib/clock"

function freeIntervals(start: number, end: number, availableFrom: number): FreeInterval[] {
  if (end <= start) return []
  const split = Math.min(end, Math.max(start, availableFrom))
  const intervals: FreeInterval[] = []

  if (split > start) {
    intervals.push({ kind: "free", start: formatMinutes(start), end: formatMinutes(split), elapsed: true, selection: null })
  }

  if (split < end) {
    const selection =
      end - split >= BookingRule.MinDuration
        ? { start: formatMinutes(split), end: formatMinutes(Math.min(end, split + BookingRule.SuggestedDuration)) }
        : null

    intervals.push({ kind: "free", start: formatMinutes(split), end: formatMinutes(end), elapsed: false, selection })
  }

  return intervals
}

export function getDayFeed(date: string, bookings: Booking[], now: Date): DayFeedModel {
  const { date: today, minutes } = roomTime(now)
  const past = date < today || (date === today && minutes >= BookingRule.End)
  const availableFrom = date === today ? Math.ceil(minutes / BookingRule.Step) * BookingRule.Step : BookingRule.Start

  const meetings = bookings
    .filter((booking) => booking.date === date)
    .map((booking) => ({
      booking,
      start: Math.max(BookingRule.Start, parseTime(booking.start) ?? 0),
      end: Math.min(BookingRule.End, parseTime(booking.end) ?? 0),
    }))
    .filter(({ start, end }) => end > start)
    .sort((left, right) => left.start - right.start || left.end - right.end)

  const intervals: DayFeedModel["intervals"] = []
  let cursor: number = BookingRule.Start

  for (const { booking, start, end } of meetings) {
    if (!past) intervals.push(...freeIntervals(cursor, start, availableFrom))

    intervals.push({
      kind: "occupied",
      start: formatMinutes(start),
      end: formatMinutes(end),
      booking,
      editable: !past && (date > today || start >= availableFrom),
    })

    cursor = Math.max(cursor, end)
  }

  if (!past) intervals.push(...freeIntervals(cursor, BookingRule.End, availableFrom))

  return { past, fullDay: !past && meetings.length === 0 && availableFrom <= BookingRule.Start, intervals }
}
