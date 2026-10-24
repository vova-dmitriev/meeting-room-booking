import { Tone } from "@/shared/config"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { Feedback } from "@/shared/ui/feedback"
import { BootstrapPhase } from "../lifecycle/bootstrap-values"
import { BootstrapTestId } from "./test-ids"
import type { BootstrapStatusProps } from "./bootstrap-status.types"

export function BootstrapStatus({ phase, onRetry }: BootstrapStatusProps) {
  const { t } = useTranslation()
  const failed = phase === BootstrapPhase.Error

  return (
    <main data-testid={BootstrapTestId.Status} className="mx-auto flex min-h-screen max-w-xl items-center p-5">
      <div className="w-full rounded-2xl border border-line bg-panel p-5 sm:p-6">
        <h1 className="mb-5 text-xl font-semibold">{t("common.brand")}</h1>
        <Feedback
          data-testid={failed ? BootstrapTestId.Error : BootstrapTestId.Loading}
          tone={failed ? Tone.Danger : Tone.Neutral}
          title={failed ? t("bootstrap.errorTitle") : t("bootstrap.loadingTitle")}
          description={failed ? t("bootstrap.errorDescription") : t("bootstrap.loadingDescription")}
        />
        {failed && (
          <Button data-testid={BootstrapTestId.Retry} onClick={onRetry} className="mt-5 w-full sm:w-auto">
            {t("bootstrap.retry")}
          </Button>
        )}
      </div>
    </main>
  )
}
