import { createContext, useContext } from "react"
import type { Theme } from "@/shared/config"

export interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const value = useContext(ThemeContext)

  if (!value) throw new Error("ThemeProvider is required")

  return value
}
