import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { CalendarDays } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import type { DateStripProps } from "./date-strip.types"

const weekdays = [
  "calendar.weekdays.monday",
  "calendar.weekdays.tuesday",
  "calendar.weekdays.wednesday",
  "calendar.weekdays.thursday",
  "calendar.weekdays.friday",
  "calendar.weekdays.saturday",
  "calendar.weekdays.sunday",
] as const

export function DateStrip({ date, onSelect }: DateStripProps) {
  const { t } = useTranslation()

  return (
    <div
      data-testid={SchedulerTestId.Date}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel p-2.5 sm:flex-nowrap"
    >
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold whitespace-nowrap">
        <CalendarDays size={17} className="text-muted" aria-hidden />
        {t("demo.uiKit.dateFull")}
      </div>
      <div
        className={cn(
          "grid min-w-0 flex-1 basis-full grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-1 border-t border-line pt-2",
          "sm:basis-auto sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3",
        )}
      >
        {weekdays.map((day, index) => {
          const value = `2026-10-${index + 19}`
          const active = value === date

          return (
            <Button
              variant={ButtonVariant.Ghost}
              key={day}
              data-testid={SchedulerTestId.Day}
              data-date={value}
              aria-pressed={active}
              onClick={() => onSelect(value)}
              className={cn(
                cn("flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs", "transition-colors"),
                active ? "bg-accent font-semibold text-on-accent" : "text-muted hover:bg-subtle",
              )}
            >
              <span className="text-[10px]">{t(day)}</span>
              <span className="text-sm font-semibold">{index + 19}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
