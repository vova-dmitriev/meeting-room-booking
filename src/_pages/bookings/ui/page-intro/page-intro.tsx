import { useTranslation } from "@/shared/lib/i18n"
import { Sparkles } from "lucide-react"

export function PageIntro() {
  const { t } = useTranslation()

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.13em] uppercase text-muted">
          <Sparkles size={12} aria-hidden />
          {t("workspace.dayLabel")}
        </p>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.045em] sm:text-[35px]">{t("workspace.greeting")}</h1>
        <p className="mt-3 max-w-xl text-xs/relaxed text-muted sm:text-sm">{t("workspace.intro")}</p>
      </div>
    </div>
  )
}
