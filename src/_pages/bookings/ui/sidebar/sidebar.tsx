import { ArrowUpRight, CalendarDays, Command, DoorOpen, HelpCircle } from "lucide-react"
import { useTranslation } from "@/shared/lib/i18n"
import { PageTestId } from "@/_pages/bookings/config/test-ids"

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside
      data-testid={PageTestId.Sidebar}
      aria-label={t("navigation.workspace")}
      className="hidden min-h-screen w-56 shrink-0 flex-col bg-sidebar px-4 py-7 text-sidebar-text lg:flex"
    >
      <a href="#main" className="mb-14 flex items-center gap-2.5 px-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-active">
          <Command size={21} aria-hidden />
        </span>
        <span className="text-2xl font-semibold tracking-tight">{t("common.brand")}</span>
        <span className="ml-1 mt-1 size-1.5 rounded-full bg-sidebar-muted" aria-hidden />
      </a>
      <p className="mb-4 px-3 text-[9px] font-medium tracking-[0.16em] uppercase text-sidebar-muted">{t("navigation.workspace")}</p>
      <nav data-testid={PageTestId.Nav} aria-label={t("navigation.workspace")} className="space-y-1">
        <a href="#main" aria-current="page" className="flex items-center gap-3 rounded-xl bg-sidebar-active p-3 text-sm">
          <CalendarDays size={17} aria-hidden />
          {t("navigation.bookings")}
          <span className="ml-auto rounded-md bg-sidebar/40 px-1.5 py-0.5 text-[10px]">01</span>
        </a>
        <a href="#room" className="flex items-center gap-3 rounded-xl p-3 text-sm text-sidebar-muted hover:bg-sidebar-active">
          <DoorOpen size={17} aria-hidden />
          {t("navigation.rooms")}
        </a>
      </nav>
      <div className="mt-auto pt-20">
        <div className="rounded-xl border border-sidebar-active p-3.5">
          <HelpCircle size={17} className="text-sidebar-muted" aria-hidden />
          <p className="mt-3 text-xs font-medium">{t("navigation.help")}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-sidebar-muted">{t("navigation.helpDescription")}</p>
          <a href="#booking-guide" className="mt-4 flex items-center justify-between text-[10px] text-sidebar-text">
            {t("navigation.helpAction")}
            <ArrowUpRight size={13} aria-hidden />
          </a>
        </div>
        <div className="mt-6 flex items-center gap-2.5 border-t border-sidebar-active px-1 pt-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-sidebar-active text-xs font-medium">AM</div>
          <div>
            <p className="text-xs font-medium">{t("demo.profile.name")}</p>
            <p className="mt-1 text-[10px] text-sidebar-muted">{t("demo.profile.role")}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
