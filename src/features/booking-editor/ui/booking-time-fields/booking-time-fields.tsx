import { BookingField, BookingRule, BookingTime } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import { useTranslation } from "@/shared/lib/i18n"
import { TimeUnit } from "@/shared/lib/time"
import { TextField } from "@/shared/ui/text-field"
import type { BookingTimeFieldsProps } from "./booking-time-fields.types"

export function BookingTimeFields({ model }: BookingTimeFieldsProps) {
  const { t } = useTranslation()
  const error = model.error ? t(model.error) : undefined
  const disabled = model.unavailable || model.pending || model.success

  return (
    <div data-testid={EditorTestId.TimeFields} className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="booking-start"
          data-testid={EditorTestId.Start}
          label={t("booking.form.fields.start")}
          type="time"
          disabled={disabled}
          min={model.startMin}
          max={BookingTime.LastStart}
          step={BookingRule.Step * TimeUnit.SecondsPerMinute}
          value={model.draft.start}
          onChange={(event) => model.update(BookingField.Start, event.target.value)}
          error={error}
          errorId={EditorTestId.TimeError}
        />
        <TextField
          id="booking-end"
          data-testid={EditorTestId.End}
          label={t("booking.form.fields.end")}
          type="time"
          disabled={disabled}
          min={model.endMin}
          max={BookingTime.End}
          step={BookingRule.Step * TimeUnit.SecondsPerMinute}
          value={model.draft.end}
          onChange={(event) => model.update(BookingField.End, event.target.value)}
          error={error}
          errorId={EditorTestId.TimeError}
        />
      </div>
      <p id={EditorTestId.TimeError} data-testid={EditorTestId.TimeError} className="min-h-8 text-xs/4 text-danger">
        {error}
      </p>
    </div>
  )
}
