import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { BookingTestId, BookingRule } from "@/entities/booking/config/booking-values"
import { parseTime } from "@/entities/booking/lib/time"
import type { DayScheduleProps } from "./day-schedule.types"

const hours = Array.from({ length: 10 }, (_, index) => index + 9)

export function DaySchedule({ bookings }: DayScheduleProps) {
  const { t } = useTranslation()
  const span = BookingRule.End - BookingRule.Start

  return (
    <section data-testid={BookingTestId.Schedule} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("booking.schedule.title")}</h2>
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-soft" aria-hidden />
            {t("booking.schedule.free")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-accent" aria-hidden />
            {t("booking.schedule.occupied")}
          </span>
        </div>
      </div>
      <div
        data-testid={BookingTestId.Timeline}
        role="region"
        aria-label={t("booking.schedule.title")}
        tabIndex={0}
        className={cn(
          "mt-7 overflow-x-auto rounded-lg pb-1",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        <div className="min-w-100">
          <div className="mb-3 flex justify-between text-[10px] text-muted tabular-nums">
            {hours.map((hour) => (
              <span key={hour}>{hour}:00</span>
            ))}
          </div>
          <div className="relative h-12 rounded-lg bg-soft">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                data-testid={BookingTestId.Slot}
                data-booking-id={booking.id}
                aria-label={`${booking.title} ${booking.start}–${booking.end}`}
                className={cn(
                  "absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-md",
                  "bg-accent px-1 text-[10px] font-medium text-on-accent",
                )}
                style={{
                  left: `${(((parseTime(booking.start) ?? 0) - BookingRule.Start) / span) * 100}%`,
                  width: `${(((parseTime(booking.end) ?? 0) - (parseTime(booking.start) ?? 0)) / span) * 100}%`,
                }}
              >
                <span className="truncate">{booking.start}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted">{t("booking.schedule.hint")}</p>
    </section>
  )
}
