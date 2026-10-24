import type { ReactNode } from "react"

export interface ModalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  returnFocusId?: string
}
