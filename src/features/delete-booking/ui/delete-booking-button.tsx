"use client"

import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"

import { Trash2 } from "lucide-react"
import { useTranslation } from "@/shared/lib/i18n"
import { useDeleteBooking } from "../model/use-delete-booking"
import type { DeleteBookingProps } from "../model/types"
import { DeleteTestId } from "../config/test-ids"

export function DeleteBookingButton(props: DeleteBookingProps) {
  const { t } = useTranslation()
  const model = useDeleteBooking(props)

  return (
    <span data-testid={DeleteTestId.Root} className="relative">
      <Button
        variant={ButtonVariant.Ghost}
        data-testid={DeleteTestId.Confirm}
        aria-label={t(model.confirming ? "booking.delete.confirm" : "common.delete")}
        disabled={model.pending}
        className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
        onClick={model.confirming ? model.confirm : model.request}
      >
        {model.confirming ? (
          <span className="text-xs font-semibold text-danger">{t("booking.delete.title")}</span>
        ) : (
          <Trash2 size={15} aria-hidden />
        )}
      </Button>
      {model.error ? (
        <span role="alert" className="absolute right-0 top-full rounded-lg bg-danger-soft p-2 text-xs text-danger">
          {t("booking.feedback.loadError.networkError")}
        </span>
      ) : null}
    </span>
  )
}
