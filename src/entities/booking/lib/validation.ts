import { BookingError, BookingRule } from "../config/booking-values"
import type { BookingInput, ValidationContext } from "../model/types"
import { parseTime } from "./time"
import { parseCalendarDate } from "@/shared/lib/date"

export function overlaps(a: BookingInput, b: BookingInput): boolean {
  return a.date === b.date && a.start < b.end && b.start < a.end
}

export function validateBooking(input: BookingInput, { bookings, now, excludeId }: ValidationContext): BookingError[] {
  const date = parseCalendarDate(input.date)
  const start = parseTime(input.start)
  const end = parseTime(input.end)

  if (!date) return [BookingError.Date]
  if (start === null || end === null || start < BookingRule.Start || end > BookingRule.End) return [BookingError.Time]
  if (start >= end) return [BookingError.Order]
  if (end - start < BookingRule.MinDuration || end - start > BookingRule.MaxDuration) return [BookingError.Duration]
  if (start % BookingRule.Step !== 0 || end % BookingRule.Step !== 0) return [BookingError.Step]
  if (new Date(`${input.date}T${input.start}:00`) < now) return [BookingError.Past]
  if (bookings.some((booking) => booking.id !== excludeId && overlaps(input, booking))) return [BookingError.Conflict]

  return []
}
