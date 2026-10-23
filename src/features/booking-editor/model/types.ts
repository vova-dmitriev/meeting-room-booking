import type { Booking, BookingInput } from "@/entities/booking"
import type { PreviewState } from "@/shared/config"

export interface BookingFormProps {
  date: string
  bookings: Booking[]
  editing?: Booking
  onCancel: () => void
  scenario?: PreviewState
}

export interface BookingDraft extends BookingInput {
  title: string
}
