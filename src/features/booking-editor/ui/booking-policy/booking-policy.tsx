import { useTranslation } from "@/shared/lib/i18n"
import { Info } from "lucide-react"

export function BookingPolicy() {
  const { t } = useTranslation()

  return (
    <div className="flex gap-3 border-t border-line bg-canvas px-6 py-4">
      <Info size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
      <div>
        <p className="text-xs font-semibold">{t("booking.policy.title")}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{t("booking.policy.description")}</p>
      </div>
    </div>
  )
}
