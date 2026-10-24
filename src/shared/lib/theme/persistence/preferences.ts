import { Theme } from "@/shared/config"

export const ThemePreference = {
  StorageKey: "meeting-room-theme",
  MediaQuery: "(prefers-color-scheme: dark)",
  ChangeEvent: "theme-preference-change",
} as const

function readThemePreference(): Theme | undefined {
  try {
    const saved = window.localStorage.getItem(ThemePreference.StorageKey)

    return saved === Theme.Light || saved === Theme.Dark ? saved : undefined
  } catch {
    return undefined
  }
}

export function getSystemTheme(): Theme {
  return window.matchMedia(ThemePreference.MediaQuery).matches ? Theme.Dark : Theme.Light
}

export function getPreferredTheme(): Theme {
  return readThemePreference() ?? getSystemTheme()
}

export function saveThemePreference(theme: Theme): void {
  try {
    window.localStorage.setItem(ThemePreference.StorageKey, theme)
  } catch {
    return
  }

  window.dispatchEvent(new Event(ThemePreference.ChangeEvent))
}

export function subscribeToTheme(onChange: () => void): () => void {
  const preference = window.matchMedia(ThemePreference.MediaQuery)

  preference.addEventListener("change", onChange)
  window.addEventListener("storage", onChange)
  window.addEventListener(ThemePreference.ChangeEvent, onChange)

  return () => {
    preference.removeEventListener("change", onChange)
    window.removeEventListener("storage", onChange)
    window.removeEventListener(ThemePreference.ChangeEvent, onChange)
  }
}
