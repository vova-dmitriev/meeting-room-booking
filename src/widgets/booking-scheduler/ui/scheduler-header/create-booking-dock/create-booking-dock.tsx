import { Plus } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import type { CreateBookingDockProps } from "./create-booking-dock.types"

export function CreateBookingDock({ unavailable, onCreate }: CreateBookingDockProps) {
  const { t } = useTranslation()

  return (
    <div
      data-testid={SchedulerTestId.CreateDock}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 order-4 border-t border-line bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        "sm:static sm:border-0 sm:p-0",
      )}
    >
      <Button
        id="create-booking"
        data-testid={SchedulerTestId.Create}
        disabled={unavailable}
        onClick={() => onCreate()}
        icon={<Plus size={17} aria-hidden />}
        className="w-full sm:w-auto"
      >
        {t(unavailable ? "dayFeed.ended" : "booking.form.createAction")}
      </Button>
    </div>
  )
}
