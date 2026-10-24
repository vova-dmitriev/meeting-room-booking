import type { Booking } from "@/entities/booking/model/types"

export interface DayFeedProps {
  date: string
  bookings: Booking[]
  now: Date
  onSelectInterval: (start: string, end: string) => void
  onEdit: (booking: Booking) => void
}
