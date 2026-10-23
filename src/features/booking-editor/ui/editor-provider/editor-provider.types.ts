import type { ReactNode } from "react"
import type { BookingFormProps } from "@/features/booking-editor/model/types"

export interface EditorProviderProps {
  options: BookingFormProps
  children: ReactNode
}
