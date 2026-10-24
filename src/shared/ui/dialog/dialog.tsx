"use client"

import { useRef } from "react"
import { Dialog } from "radix-ui"
import { X } from "lucide-react"
import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { useTheme } from "@/shared/lib/theme"
import { useTranslation } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { isToastInteraction } from "@/shared/ui/toast"
import type { ModalDialogProps } from "./dialog.types"
import { DialogTestId } from "./test-ids"

export function ModalDialog({ open, onOpenChange, title, children, returnFocusId }: ModalDialogProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const previousFocus = useRef<HTMLElement | null>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay data-testid={DialogTestId.Overlay} data-theme={theme} className="fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content
          data-testid={DialogTestId.Root}
          data-theme={theme}
          aria-describedby={undefined}
          onInteractOutside={(event) => {
            if (isToastInteraction(event.target)) event.preventDefault()
          }}
          onOpenAutoFocus={() => {
            previousFocus.current = document.activeElement as HTMLElement | null
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const target = previousFocus.current?.isConnected ? previousFocus.current : document.getElementById(returnFocusId ?? "")

            target?.focus()
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md",
            "-translate-1/2 overflow-y-auto rounded-2xl border border-line bg-panel p-5 text-ink shadow-lg sm:p-6",
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <Dialog.Title data-testid={DialogTestId.Title} className="text-lg font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button data-testid={DialogTestId.Close} variant={ButtonVariant.Ghost} aria-label={t("common.close")} className="p-2">
                <X size={18} aria-hidden />
              </Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
