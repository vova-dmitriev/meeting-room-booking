import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import { Theme } from "@/shared/config"

function getSystemTheme() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light
}

function getServerTheme() {
  return Theme.Light
}

function subscribeToSystemTheme(onChange: () => void) {
  const preference = window.matchMedia("(prefers-color-scheme: dark)")

  preference.addEventListener("change", onChange)

  return () => {
    preference.removeEventListener("change", onChange)
  }
}

export function useThemeState(initialTheme?: Theme) {
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, getServerTheme)
  const [manualTheme, setManualTheme] = useState<Theme>()
  const theme = manualTheme ?? initialTheme ?? systemTheme

  const toggle = useCallback(() => {
    setManualTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)
  }, [theme])

  return useMemo(() => {
    return { theme, toggle }
  }, [theme, toggle])
}
