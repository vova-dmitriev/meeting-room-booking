import { Skeleton } from "@/shared/ui/skeleton"
import { ScheduleSkeletonTestId } from "./test-ids"

export function BookingListSkeleton() {
  return (
    <div data-testid={ScheduleSkeletonTestId.List} aria-hidden className="space-y-3">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
    </div>
  )
}
