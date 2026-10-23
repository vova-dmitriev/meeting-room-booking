import type { ReactNode } from "react"
import type { Theme } from "@/shared/config"

export interface ThemeProviderProps {
  initialTheme: Theme
  children: ReactNode
}
