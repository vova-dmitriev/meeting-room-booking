import { Theme } from "@/shared/config"
import { ThemePreference } from "./preferences"

const preference = JSON.stringify(ThemePreference)
const themes = JSON.stringify(Theme)

export const themeInitScript = `(() => {
  const preference = ${preference};
  const themes = ${themes};
  let theme;
  try { theme = localStorage.getItem(preference.StorageKey); } catch {}
  if (theme !== themes.Light && theme !== themes.Dark) {
    theme = matchMedia(preference.MediaQuery).matches ? themes.Dark : themes.Light;
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();`
