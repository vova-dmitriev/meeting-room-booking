import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"
import { PageTestId } from "@/_pages/bookings/config/test-ids"
import { ChevronRight, MapPin, Moon } from "lucide-react"
import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { useThemeToggle } from "@/_pages/bookings/model/use-theme-toggle"

export function WorkspaceHeader() {
  const { t } = useTranslation()
  const toggleTheme = useThemeToggle()

  return (
    <header className="flex h-19 items-center justify-between border-b border-line bg-panel/60 px-5 sm:px-8 xl:px-10">
      <div className="flex items-center gap-2 text-xs">
        <span className="hidden text-muted sm:block">{t("navigation.workspace")}</span>
        <ChevronRight size={13} className="hidden text-muted sm:block" aria-hidden />
        <span className="font-medium">{t("navigation.bookings")}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
          <MapPin size={13} aria-hidden />
          {t("workspace.office")}
        </span>
        <span className="h-5 border-l border-line" aria-hidden />
        <Button
          variant={ButtonVariant.Ghost}
          data-testid={PageTestId.Theme}
          onClick={toggleTheme}
          aria-label={t("common.theme")}
          className="rounded-lg p-2 text-muted hover:bg-subtle"
        >
          <Moon size={17} aria-hidden />
        </Button>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-line bg-soft",
            "text-[10px] font-semibold text-accent",
          )}
        >
          AM
        </span>
      </div>
    </header>
  )
}
