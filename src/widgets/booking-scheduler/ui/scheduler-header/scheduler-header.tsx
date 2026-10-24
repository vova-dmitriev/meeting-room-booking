import { DateStrip } from "../date-strip/date-strip"
import { RoomHeading } from "./room-heading/room-heading"
import { ThemeControl } from "./theme-control/theme-control"
import { CreateBookingDock } from "./create-booking-dock/create-booking-dock"
import type { SchedulerHeaderProps } from "./scheduler-header.types"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"

export function SchedulerHeader({ model }: SchedulerHeaderProps) {
  return (
    <header
      data-testid={SchedulerTestId.Header}
      className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 sm:gap-5"
    >
      <RoomHeading />
      <div className="order-3 w-full sm:order-2 sm:w-72">
        <DateStrip date={model.date} onSelect={model.selectDate} />
      </div>
      <ThemeControl onToggle={model.toggleTheme} />
      <CreateBookingDock unavailable={model.unavailable} onCreate={model.create} />
    </header>
  )
}
