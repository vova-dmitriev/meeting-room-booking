import { DayFeedTestId } from "@/entities/booking/ui/day-feed/test-ids"
import type { IntervalLabelProps } from "./interval-label.types"

export function IntervalLabel({ start, end }: IntervalLabelProps) {
  return (
    <span
      data-testid={DayFeedTestId.IntervalLabel}
      className="pt-3 text-xs font-medium whitespace-nowrap text-muted tabular-nums sm:text-sm"
    >
      {start}–{end}
    </span>
  )
}
