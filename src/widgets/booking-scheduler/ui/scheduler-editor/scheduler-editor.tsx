import { BookingForm } from "@/features/booking-editor"
import { DeleteBookingButton } from "@/features/delete-booking"
import { useTranslation } from "@/shared/lib/i18n"
import { ModalDialog } from "@/shared/ui/dialog"
import type { SchedulerEditorProps } from "./scheduler-editor.types"

export function SchedulerEditor({ model, scenario }: SchedulerEditorProps) {
  const { t } = useTranslation()

  return (
    <ModalDialog
      open={model.editorOpen}
      onOpenChange={(open) => {
        if (!open) model.cancel()
      }}
      title={t(model.editing ? "booking.form.editTitle" : "booking.form.createTitle")}
      returnFocusId="create-booking"
    >
      <BookingForm
        key={model.editorSession}
        date={model.date}
        bookings={model.bookings}
        editing={model.editing}
        interval={model.interval}
        onCancel={model.cancel}
        onSaved={model.complete}
        scenario={scenario}
        hideHeading
        actions={
          model.editing ? (
            <div className="mt-3 text-center">
              <DeleteBookingButton {...model.editing} onDeleted={model.bookingDeleted} />
            </div>
          ) : null
        }
      />
    </ModalDialog>
  )
}
