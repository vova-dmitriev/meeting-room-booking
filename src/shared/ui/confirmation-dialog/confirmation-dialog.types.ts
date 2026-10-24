import type { ReactElement, ReactNode } from "react"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  pending?: boolean
  children?: ReactNode
}
