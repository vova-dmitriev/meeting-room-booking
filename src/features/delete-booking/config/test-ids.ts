import { ConfirmationDialogTestId } from "@/shared/ui/confirmation-dialog"

export const DeleteTestId = {
  Root: "delete-booking",
  Trigger: "confirm-delete-booking",
  Confirm: ConfirmationDialogTestId.Confirm,
  Dialog: ConfirmationDialogTestId.Root,
  Cancel: ConfirmationDialogTestId.Cancel,
  Summary: "delete-booking-summary",
  Error: "delete-booking-error",
} as const
