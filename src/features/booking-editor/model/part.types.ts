import type { useBookingEditor } from "./use-booking-editor"
import type { BookingFormProps } from "./types"

export interface BookingFormPartProps {
  model: ReturnType<typeof useBookingEditor>
  props: BookingFormProps
}
