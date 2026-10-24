import type { Booking } from "../model/types"

interface FeedSelection {
  start: string
  end: string
}

export interface FreeInterval extends FeedSelection {
  kind: "free"
  elapsed: boolean
  selection: FeedSelection | null
}

export interface OccupiedInterval extends FeedSelection {
  kind: "occupied"
  booking: Booking
  editable: boolean
}

export interface DayFeedModel {
  past: boolean
  fullDay: boolean
  intervals: (FreeInterval | OccupiedInterval)[]
}
