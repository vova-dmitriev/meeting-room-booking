import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { DayFeedTestId } from "@/entities/booking/ui/day-feed/test-ids"
import { IntervalLabel } from "../interval-label"
import type { FreeIntervalProps } from "./free-interval.types"

export function FreeIntervalRow({ interval, fullDay, onSelectInterval }: FreeIntervalProps) {
  const { t } = useTranslation()
  const { selection } = interval
  const label = fullDay ? t("dayFeed.fullDay") : t("dayFeed.free")

  return (
    <Button
      variant={ButtonVariant.Ghost}
      data-testid={DayFeedTestId.Free}
      data-start={interval.start}
      data-end={interval.end}
      data-elapsed={interval.elapsed}
      disabled={!selection}
      onClick={() => {
        if (selection) onSelectInterval(selection.start, selection.end)
      }}
      className={cn(
        "group grid h-auto w-full grid-cols-[6rem_minmax(0,1fr)] items-start justify-start gap-3 rounded-none",
        "p-0 text-left font-normal whitespace-normal hover:bg-transparent hover:text-ink dark:hover:bg-transparent",
        "disabled:opacity-100 sm:grid-cols-[7rem_minmax(0,1fr)]",
        interval.elapsed ? "text-muted" : "text-ink",
      )}
    >
      <IntervalLabel start={interval.start} end={interval.end} />
      <span
        className={cn(
          "flex min-h-11 min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl",
          "border border-dashed border-control-border bg-panel p-3",
          selection && "transition-colors group-hover:bg-subtle",
          fullDay && "min-h-25",
        )}
      >
        <span data-testid={fullDay ? DayFeedTestId.FullDay : undefined} className="text-sm wrap-anywhere">
          {interval.elapsed ? t("dayFeed.elapsed") : label}
        </span>
        <span className={cn("text-xs", selection ? "font-semibold text-accent" : "text-muted")}>
          {selection ? t("dayFeed.create") : interval.elapsed ? null : t("dayFeed.tooShort")}
        </span>
      </span>
    </Button>
  )
}
