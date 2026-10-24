"use client"

import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { ConfirmationDialog } from "@/shared/ui/confirmation-dialog"

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
      <ConfirmationDialog
        open={model.confirming}
        onOpenChange={model.changeOpen}
        title={t("booking.delete.title")}
        description={t("booking.delete.description")}
        cancelLabel={t("common.cancel")}
        confirmLabel={t("booking.delete.confirm")}
        pending={model.pending}
        onConfirm={model.confirm}
        trigger={
          <Button
            variant={ButtonVariant.Ghost}
            data-testid={DeleteTestId.Trigger}
            aria-label={t("common.delete")}
            className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 size={16} aria-hidden />
            <span className="sm:sr-only">{t("common.delete")}</span>
          </Button>
        }
      >
        <p data-testid={DeleteTestId.Summary} className="mt-4 rounded-xl bg-subtle p-3 text-sm/relaxed wrap-anywhere">
          <span className="block font-semibold">{props.title || t("booking.list.untitled")}</span>
          <span className="text-muted">
            {props.date} · {props.start} - {props.end}
          </span>
        </p>
        {model.error ? (
          <p data-testid={DeleteTestId.Error} role="alert" className="mt-4 text-sm text-danger">
            {t("booking.delete.error")}
          </p>
        ) : null}
      </ConfirmationDialog>
    </span>
  )
}
