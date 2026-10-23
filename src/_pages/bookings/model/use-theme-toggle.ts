import { useTheme } from "@/shared/lib/theme"

export function useThemeToggle() {
  return useTheme().toggle
}
