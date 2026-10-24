import { ThemeContext } from "./theme-context"
import type { ThemeProviderProps } from "./theme-provider.types"
import { ThemeTestId } from "./test-ids"
import { useThemeState } from "./use-theme-state"

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const value = useThemeState(initialTheme)

  return (
    <ThemeContext.Provider value={value}>
      <div data-testid={ThemeTestId.Root} data-theme={value.theme} className="min-h-screen bg-canvas text-ink">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
