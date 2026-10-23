import { cn } from "@/shared/lib/cn"
import { useTranslation } from "@/shared/lib/i18n"

export function WorkspaceFooter() {
  const { t } = useTranslation()

  return (
    <footer
      id="booking-guide"
      className={cn("mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5", "text-[10px] text-muted")}
    >
      <span>{t("workspace.footer")}</span>
      <span>{t("demo.note")}</span>
    </footer>
  )
}
