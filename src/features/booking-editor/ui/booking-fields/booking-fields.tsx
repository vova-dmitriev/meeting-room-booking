import { useTranslation } from "@/shared/lib/i18n"
import { Clock3 } from "lucide-react"
import { TextField } from "@/shared/ui/text-field"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import type { BookingFormPartProps } from "@/features/booking-editor/model/part.types"
import { BookingRule } from "@/entities/booking"

export function BookingFields({ model, props }: BookingFormPartProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      <TextField
        id="booking-date"
        data-testid={EditorTestId.Date}
        label={t("booking.form.fields.date")}
        type="date"
        value={props.date}
        error={model.unavailable ? t("booking.validation.past") : undefined}
        readOnly
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="booking-start"
          data-testid={EditorTestId.Start}
          label={t("booking.form.fields.start")}
          type="time"
          disabled={model.unavailable}
          min={model.startMin}
          max="17:30"
          step={BookingRule.Step * 60}
          value={model.draft.start}
          onChange={(event) => model.update("start", event.target.value)}
          error={model.error ? t(model.error) : undefined}
        />
        <TextField
          id="booking-end"
          data-testid={EditorTestId.End}
          label={t("booking.form.fields.end")}
          type="time"
          disabled={model.unavailable}
          min={model.endMin}
          max="18:00"
          step={BookingRule.Step * 60}
          value={model.draft.end}
          onChange={(event) => model.update("end", event.target.value)}
        />
      </div>
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
        onChange={(event) => model.update("title", event.target.value)}
      />
    </div>
  )
}
