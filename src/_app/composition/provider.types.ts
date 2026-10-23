import type { ReactNode } from "react"
import type { Theme } from "@/shared/config"

export interface ProviderProps {
  children: ReactNode
  theme?: Theme
}
