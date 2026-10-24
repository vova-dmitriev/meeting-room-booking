"use client"

import { useContext, useEffect } from "react"
import { ThemeContext } from "./theme-context"
import type { ThemeProviderProps } from "./theme-provider.types"
import { ThemeTestId } from "./test-ids"
import { useThemeState } from "./use-theme-state"

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const parentTheme = useContext(ThemeContext)
  const persistent = parentTheme === null && initialTheme === undefined
  const value = useThemeState(initialTheme, persistent)
  const { appliedTheme } = value

  useEffect(() => {
    if (!persistent || !appliedTheme) return

    document.documentElement.dataset.theme = appliedTheme
    document.documentElement.style.colorScheme = appliedTheme
  }, [appliedTheme, persistent])

  return (
    <ThemeContext.Provider value={value}>
      <div data-testid={ThemeTestId.Root} data-theme={appliedTheme} className="min-h-screen bg-canvas text-ink">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
