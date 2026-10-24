import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { BookingTestId } from "@/entities/booking/config/booking-values"
import { IntervalLabel } from "../interval-label"
import type { OccupiedIntervalProps } from "./occupied-interval.types"

export function OccupiedIntervalRow({ interval, onEdit }: OccupiedIntervalProps) {
  const { t } = useTranslation()
  const { booking } = interval
  const title = booking.title || t("dayFeed.untitled")

  return (
    <article
      data-testid={BookingTestId.Card}
      data-booking-id={booking.id}
      className={cn("grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3", "sm:grid-cols-[7rem_minmax(0,1fr)]")}
    >
      <IntervalLabel start={interval.start} end={interval.end} />
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-2 rounded-xl bg-soft p-3">
        <div className="min-w-0 flex-1 basis-40">
          <h3 className="text-sm/relaxed font-semibold wrap-anywhere">{title}</h3>
          <p className="mt-1 text-xs text-muted">{t("dayFeed.occupied")}</p>
        </div>
        <Button
          variant={ButtonVariant.Ghost}
          data-testid={BookingTestId.Edit}
          disabled={!interval.editable}
          aria-label={t("dayFeed.editMeeting", { title })}
          onClick={() => {
            onEdit(booking)
          }}
          className="rounded-lg px-3 text-xs text-accent disabled:text-muted disabled:opacity-100"
        >
          {t("dayFeed.edit")}
        </Button>
      </div>
    </article>
  )
}
