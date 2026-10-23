import { useTranslation } from "@/shared/lib/i18n"
import { ArrowUpRight } from "lucide-react"
import { Tone, ButtonVariant } from "@/shared/config"
import { Feedback } from "@/shared/ui/feedback"
import { Button } from "@/shared/ui/button"
import { EditorTestId } from "@/features/booking-editor/config/test-ids"
import type { BookingFormPartProps } from "@/features/booking-editor/model/part.types"

export function BookingActions({ model, props }: BookingFormPartProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 space-y-3">
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
      {model.success ? (
        <Feedback tone={Tone.Success} title={t("booking.feedback.success.title")} description={t("booking.feedback.success.description")} />
      ) : null}
      <Button
        data-testid={EditorTestId.Submit}
        type="submit"
        loading={model.pending}
        disabled={model.unavailable}
        className="w-full"
        icon={<ArrowUpRight size={16} aria-hidden />}
      >
        {t(model.pending ? "booking.form.sending" : props.editing ? "common.save" : "booking.form.submit")}
      </Button>
      {props.editing ? (
        <Button data-testid={EditorTestId.Cancel} variant={ButtonVariant.Ghost} className="w-full" onClick={model.cancel}>
          {t("common.cancel")}
        </Button>
      ) : null}
      <p className="text-center text-[10px] leading-relaxed text-muted">{t("booking.policy.text")}</p>
    </div>
  )
}
