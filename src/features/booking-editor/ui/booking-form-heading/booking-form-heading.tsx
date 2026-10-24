import { useTranslation } from "@/shared/lib/i18n"
import { ArrowUpRight } from "lucide-react"
import type { BookingFormPartProps } from "@/features/booking-editor/model/part.types"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"

export function BookingFormHeading({ props }: BookingFormPartProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={EditorTestId.Heading} className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{t(props.editing ? "booking.form.editTitle" : "booking.form.createTitle")}</h2>
        <p className="mt-2 max-w-60 text-xs/relaxed text-muted">{t("booking.form.hint")}</p>
      </div>
      <span className="flex size-9 items-center justify-center rounded-xl bg-soft text-accent">
        <ArrowUpRight size={19} aria-hidden />
      </span>
    </div>
  )
}
