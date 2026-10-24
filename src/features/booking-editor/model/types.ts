import type { Booking, BookingInput } from "@/entities/booking"
import type { PreviewState } from "@/shared/config"
import type { ReactNode } from "react"

export interface BookingFormProps {
  date: string
  bookings: Booking[]
  editing?: Booking
  onCancel: () => void
  onSaved?: (date: string) => void
  interval?: { start: string; end: string }
  hideHeading?: boolean
  actions?: ReactNode
  scenario?: PreviewState
}

export interface BookingDraft extends BookingInput {
  title: string
}

export interface BookingSaveRequest {
  input: Readonly<BookingInput>
  originalDate: string
  bookingId?: string
  onSaved?: (date: string) => void
}
