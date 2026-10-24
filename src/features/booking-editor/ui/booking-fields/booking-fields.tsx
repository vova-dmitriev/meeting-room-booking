import { useTranslation } from "@/shared/lib/i18n"
import { Clock3 } from "lucide-react"
import { TextField } from "@/shared/ui/text-field"
import { DateField } from "@/shared/ui/date-field"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import type { BookingFormPartProps } from "@/features/booking-editor/model/part.types"
import { BookingField } from "@/entities/booking"
import { BookingTimeFields } from "../booking-time-fields/booking-time-fields"

export function BookingFields({ model }: BookingFormPartProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={EditorTestId.Fields} className="space-y-5">
      <DateField
        id="booking-date"
        data-testid={EditorTestId.Date}
        label={t("booking.form.fields.date")}
        value={model.draft.date}
        disabled={model.pending || model.success}
        onChange={(event) => model.update(BookingField.Date, event.target.value)}
        error={model.dateError ? t(model.dateError) : undefined}
      />
      <BookingTimeFields model={model} />
      <p className="-mt-2 flex items-center gap-1.5 text-[11px] text-muted">
        <Clock3 size={12} aria-hidden />
        {t("booking.form.durationHint")}
      </p>
      <TextField
        id="booking-title"
        data-testid={EditorTestId.Title}
        label={`${t("booking.form.fields.title")} · ${t("common.optional")}`}
        placeholder={t("booking.form.fields.titlePlaceholder")}
        value={model.draft.title}
        disabled={model.pending || model.success}
        onChange={(event) => model.update(BookingField.Title, event.target.value)}
      />
    </div>
  )
}
