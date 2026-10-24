import { BookingScheduleSkeleton } from "@/widgets/booking-scheduler"
import { Tone } from "@/shared/config"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { Feedback } from "@/shared/ui/feedback"
import { BootstrapPhase } from "../lifecycle/bootstrap-values"
import { BootstrapTestId } from "./test-ids"
import type { BootstrapStatusProps } from "./bootstrap-status.types"

export function BootstrapStatus({ phase, onRetry }: BootstrapStatusProps) {
  const { t } = useTranslation()

  if (phase === BootstrapPhase.Loading) {
    return (
      <main data-testid={BootstrapTestId.Status} className="min-h-screen bg-panel text-ink">
        <div data-testid={BootstrapTestId.Loading} role="status" aria-label={t("booking.feedback.loading")}>
          <BookingScheduleSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main data-testid={BootstrapTestId.Status} className="mx-auto flex min-h-screen max-w-xl items-center p-5">
      <div className="w-full rounded-2xl border border-line bg-panel p-5 sm:p-6">
        <h1 className="mb-5 text-xl font-semibold">{t("common.brand")}</h1>
        <Feedback
          data-testid={BootstrapTestId.Error}
          tone={Tone.Danger}
          title={t("bootstrap.errorTitle")}
          description={t("bootstrap.errorDescription")}
        />
        <Button data-testid={BootstrapTestId.Retry} onClick={onRetry} className="mt-5 w-full sm:w-auto">
          {t("bootstrap.retry")}
        </Button>
      </div>
    </main>
  )
}
