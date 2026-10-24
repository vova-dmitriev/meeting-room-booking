import { useTranslation } from "@/shared/lib/i18n"
import { PageTestId } from "@/_pages/bookings/config/test-ids"

export function WorkspaceFooter() {
  const { t } = useTranslation()

  return (
    <footer id="booking-guide" data-testid={PageTestId.Footer} className="mt-5 border-t border-line pt-4 text-center text-xs text-muted">
      <span>{t("demo.note")}</span>
    </footer>
  )
}
