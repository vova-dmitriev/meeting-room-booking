"use client"

import { AlertDialog } from "radix-ui"
import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { useTheme } from "@/shared/lib/theme"
import { Button } from "@/shared/ui/button"
import type { ConfirmationDialogProps } from "./confirmation-dialog.types"
import { ConfirmationDialogTestId } from "./test-ids"

export function ConfirmationDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending,
  children,
}: ConfirmationDialogProps) {
  const { theme } = useTheme()

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          data-testid={ConfirmationDialogTestId.Overlay}
          data-theme={theme}
          className="fixed inset-0 z-50 bg-ink/50"
          onClick={(event) => {
            if (event.target !== event.currentTarget || pending) return
            event.stopPropagation()
            onOpenChange(false)
          }}
        />
        <AlertDialog.Content
          data-testid={ConfirmationDialogTestId.Root}
          data-theme={theme}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md",
            "-translate-1/2  overflow-y-auto rounded-2xl border border-line bg-panel p-5 text-ink shadow-lg sm:p-6",
          )}
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault()
          }}
        >
          <AlertDialog.Title className="text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm/relaxed text-muted">{description}</AlertDialog.Description>
          {children}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button data-testid={ConfirmationDialogTestId.Cancel} variant={ButtonVariant.Secondary} disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <Button data-testid={ConfirmationDialogTestId.Confirm} variant={ButtonVariant.Danger} loading={pending} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
