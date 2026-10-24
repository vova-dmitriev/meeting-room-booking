import { ButtonVariant, Tone } from "@/shared/config"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { Feedback } from "@/shared/ui/feedback"
import type { ErrorFallbackProps } from "./error-fallback.types"
import { ErrorBoundaryTestId } from "./test-ids"

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={ErrorBoundaryTestId.Root} className="my-3">
      <Feedback tone={Tone.Danger} title={t("errorBoundary.title")} description={t("errorBoundary.description")} />
      <Button data-testid={ErrorBoundaryTestId.Retry} variant={ButtonVariant.Secondary} onClick={onRetry} className="mt-3">
        {t("common.retry")}
      </Button>
    </div>
  )
}
