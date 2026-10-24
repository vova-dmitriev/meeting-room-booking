import { useTranslation } from "@/shared/lib/i18n"
import { getDayFeed } from "@/entities/booking/lib/day-feed"
import { DayFeedTestId } from "./test-ids"
import { FreeIntervalRow } from "./rows/free-interval"
import { OccupiedIntervalRow } from "./rows/occupied-interval"
import { IntervalLabel } from "./rows/interval-label"
import type { DayFeedProps } from "./day-feed.types"
import { BookingTime } from "@/entities/booking/config/booking-values"

export function DayFeed({ date, bookings, now, onSelectInterval, onEdit }: DayFeedProps) {
  const { t } = useTranslation()
  const feed = getDayFeed(date, bookings, now)

  return (
    <div data-testid={DayFeedTestId.Root} className="flex flex-col gap-3">
      {feed.past && (
        <div
          data-testid={DayFeedTestId.Past}
          className="grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]"
        >
          <IntervalLabel start={BookingTime.Start} end={BookingTime.End} />
          <p className="rounded-xl border border-line bg-canvas p-3 text-sm text-muted">{t("dayFeed.ended")}</p>
        </div>
      )}
      {feed.intervals.map((interval) =>
        interval.kind === "occupied" ? (
          <OccupiedIntervalRow key={interval.booking.id} interval={interval} onEdit={onEdit} />
        ) : (
          <FreeIntervalRow
            key={`${interval.start}-${interval.end}`}
            interval={interval}
            fullDay={feed.fullDay}
            onSelectInterval={onSelectInterval}
          />
        ),
      )}
    </div>
  )
}
