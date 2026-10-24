import { getDayFeed, type Booking } from "@/entities/booking"
import { dateFromSearch } from "./date-url"

const BookingParameter = "booking"

export function bookingIdFromSearch(search: string): string | undefined {
  const id = new URLSearchParams(search).get(BookingParameter)

  return id ? id : undefined
}

export function bookingForSearch(search: string, bookings: Booking[], now: Date): Booking | undefined {
  const id = bookingIdFromSearch(search)
  const date = dateFromSearch(search, now)

  const interval = getDayFeed(date, bookings, now).intervals.find(
    (item) => item.kind === "occupied" && item.booking.id === id && item.editable,
  )

  return interval?.kind === "occupied" ? interval.booking : undefined
}
