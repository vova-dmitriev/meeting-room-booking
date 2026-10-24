import type { FreeInterval } from "@/entities/booking/lib/day-feed.types"
import type { DayFeedProps } from "@/entities/booking/ui/day-feed/day-feed.types"

export interface FreeIntervalProps {
  interval: FreeInterval
  fullDay: boolean
  onSelectInterval: DayFeedProps["onSelectInterval"]
}
