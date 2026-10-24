import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import { Theme } from "@/shared/config"
import { getPreferredTheme, getSystemTheme, saveThemePreference, subscribeToTheme } from "./persistence/preferences"

// Inherit the prepaint root theme until the browser snapshot is available.
function getServerSnapshot() {
  return undefined
}

export function useThemeState(initialTheme?: Theme, persistent = true) {
  const preferredTheme = useSyncExternalStore(subscribeToTheme, persistent ? getPreferredTheme : getSystemTheme, getServerSnapshot)
  const [manualTheme, setManualTheme] = useState<Theme>()
  const appliedTheme = manualTheme ?? initialTheme ?? preferredTheme
  const theme = appliedTheme ?? Theme.Light

  const toggle = useCallback(() => {
    const next = theme === Theme.Dark ? Theme.Light : Theme.Dark

    setManualTheme(next)

    if (persistent && initialTheme === undefined) saveThemePreference(next)
  }, [initialTheme, persistent, theme])

  return useMemo(() => {
    return { theme, appliedTheme, toggle }
  }, [appliedTheme, theme, toggle])
}
