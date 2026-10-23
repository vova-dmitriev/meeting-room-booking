import { Surface } from "@/shared/ui/surface"
import { useBookingEditor } from "@/features/booking-editor/model/use-booking-editor"
import type { BookingFormProps } from "@/features/booking-editor/model/types"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import { BookingFields } from "../booking-fields/booking-fields"
import { BookingActions } from "../booking-actions/booking-actions"
import { BookingPolicy } from "../booking-policy/booking-policy"
import { BookingFormHeading } from "../booking-form-heading/booking-form-heading"

export function BookingFormContent(props: BookingFormProps) {
  const model = useBookingEditor(props)
  const part = { model, props }

  return (
    <Surface className="overflow-hidden">
      <form data-testid={EditorTestId.Form} onSubmit={model.submit} noValidate className="p-5 sm:p-6">
        <BookingFormHeading {...part} />
        <BookingFields {...part} />
        <BookingActions {...part} />
      </form>
      <BookingPolicy />
    </Surface>
  )
}
