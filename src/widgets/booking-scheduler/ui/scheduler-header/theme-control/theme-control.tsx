import { Moon } from "lucide-react"
import { ButtonVariant } from "@/shared/config"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import type { ThemeControlProps } from "./theme-control.types"

export function ThemeControl({ onToggle }: ThemeControlProps) {
  const { t } = useTranslation()

  return (
    <Button
      data-testid={SchedulerTestId.Theme}
      variant={ButtonVariant.Ghost}
      aria-label={t("common.theme")}
      onClick={onToggle}
      className="order-2 p-2 text-muted sm:order-3"
    >
      <Moon size={18} aria-hidden />
    </Button>
  )
}
