import { Plus } from "lucide-react"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { RoomHeading } from "../scheduler-header/room-heading/room-heading"
import { BookingListSkeleton } from "./booking-list-skeleton"
import { ScheduleSkeletonTestId } from "./test-ids"

export function BookingScheduleSkeleton() {
  const { t } = useTranslation()

  return (
    <div data-testid={ScheduleSkeletonTestId.Root} className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-8 sm:pb-8">
      <header
        data-testid={ScheduleSkeletonTestId.Header}
        className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 sm:gap-5"
      >
        <RoomHeading />
        <Skeleton className="order-3 h-11 w-full sm:order-2 sm:w-72" />
        <Skeleton className="order-2 size-11 sm:order-3" />
        <div aria-hidden className="fixed inset-x-0 bottom-0 z-30 order-4 border-t border-line bg-panel p-4 sm:static sm:border-0 sm:p-0">
          <div className="relative">
            <Button disabled icon={<Plus size={17} aria-hidden />} className="invisible w-full sm:w-auto">
              {t("booking.form.createAction")}
            </Button>
            <Skeleton className="absolute inset-0" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl py-7 sm:px-6 sm:py-8">
        <BookingListSkeleton />
      </div>
    </div>
  )
}
