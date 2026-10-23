import { useCallback, useMemo, useState } from "react"
import { Theme } from "@/shared/config"
import { ThemeContext } from "./theme-context"
import type { ThemeProviderProps } from "./theme-provider.types"

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(initialTheme)

  const toggle = useCallback(() => {
    setTheme((value) => (value === Theme.Dark ? Theme.Light : Theme.Dark))
  }, [])

  const value = useMemo(() => {
    return { theme, toggle }
  }, [theme, toggle])

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme} className="min-h-screen bg-canvas text-ink">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
