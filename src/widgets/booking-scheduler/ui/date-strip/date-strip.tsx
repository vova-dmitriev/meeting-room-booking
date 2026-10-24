import { ChevronLeft, ChevronRight } from "lucide-react"
import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { DateField } from "@/shared/ui/date-field"
import { calendarWeek, shiftDate } from "@/shared/lib/date"
import { useTranslation } from "@/shared/lib/i18n"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import type { DateStripProps } from "./date-strip.types"

export function DateStrip({ date, onSelect }: DateStripProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={SchedulerTestId.Date} className="flex min-w-0 items-center gap-2">
      <Button
        data-testid={SchedulerTestId.Previous}
        variant={ButtonVariant.Secondary}
        onClick={() => onSelect(shiftDate(date, -1))}
        aria-label={t("calendar.previousDay")}
        className="p-2"
      >
        <ChevronLeft size={18} aria-hidden />
      </Button>
      <DateField
        id="schedule-date-picker"
        data-testid={SchedulerTestId.DateInput}
        label={t("calendar.selectDate")}
        value={date}
        className="min-w-0 flex-1 [&>label]:sr-only"
        onChange={(event) => {
          if (calendarWeek(event.target.value).length) onSelect(event.target.value)
        }}
      />
      <Button
        data-testid={SchedulerTestId.Next}
        variant={ButtonVariant.Secondary}
        onClick={() => onSelect(shiftDate(date, 1))}
        aria-label={t("calendar.nextDay")}
        className="p-2"
      >
        <ChevronRight size={18} aria-hidden />
      </Button>
    </div>
  )
}
