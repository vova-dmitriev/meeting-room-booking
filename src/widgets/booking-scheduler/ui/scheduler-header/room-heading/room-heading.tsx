import { useTranslation } from "@/shared/lib/i18n"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"

export function RoomHeading() {
  const { t } = useTranslation()

  return (
    <div data-testid={SchedulerTestId.RoomHeading} className="min-w-0 flex-1">
      <h1 className="text-xl font-semibold tracking-tight">{t("room.name")}</h1>
      <p className="mt-1 text-xs text-muted">
        {t("room.type")} · {t("room.capacity")} · {t("workspace.timezone")}
      </p>
    </div>
  )
}
