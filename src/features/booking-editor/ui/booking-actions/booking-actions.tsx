import { useTranslation } from "@/shared/lib/i18n"
import { Tone, ButtonVariant } from "@/shared/config"
import { Feedback } from "@/shared/ui/feedback"
import { Button } from "@/shared/ui/button"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import type { BookingFormPartProps } from "@/features/booking-editor/model/part.types"

export function BookingActions({ model, props }: BookingFormPartProps) {
  const { t } = useTranslation()

  return (
    <div data-testid={EditorTestId.Actions} className="mt-6 space-y-3">
      {model.conflict ? (
        <Feedback
          data-testid={EditorTestId.Feedback}
          tone={Tone.Danger}
          title={t("booking.feedback.conflict.title")}
          description={t(model.refreshFailed ? "booking.feedback.loadError.description" : "booking.feedback.conflict.description")}
        />
      ) : null}
      {model.refreshFailed && !model.conflict ? (
        <Feedback
          tone={Tone.Danger}
          title={t("booking.feedback.loadError.title")}
          description={t("booking.feedback.loadError.description")}
        />
      ) : null}
      <Button
        data-testid={EditorTestId.Submit}
        type="submit"
        loading={model.pending}
        disabled={model.unavailable || model.checkingDate}
        className="w-full"
      >
        {t(model.pending ? "booking.form.sending" : model.success ? "common.retry" : props.editing ? "common.save" : "booking.form.submit")}
      </Button>
      {props.editing ? (
        <Button data-testid={EditorTestId.Cancel} variant={ButtonVariant.Ghost} className="w-full" onClick={model.cancel}>
          {t("common.cancel")}
        </Button>
      ) : null}
    </div>
  )
}
