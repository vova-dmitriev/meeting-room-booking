import type { OccupiedInterval } from "@/entities/booking/lib/day-feed.types"
import type { DayFeedProps } from "@/entities/booking/ui/day-feed/day-feed.types"

export interface OccupiedIntervalProps {
  interval: OccupiedInterval
  onEdit: DayFeedProps["onEdit"]
}
