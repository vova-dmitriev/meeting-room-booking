import { cn } from "@/shared/lib/cn"
import { ArrowUpRight, Monitor, Users, Wifi } from "lucide-react"
import { useTranslation } from "@/shared/lib/i18n"
import { Tone } from "@/shared/config"
import { Badge } from "@/shared/ui/badge"
import { RoomTestId } from "./test-ids"

export function RoomSummary() {
  const { t } = useTranslation()

  return (
    <section data-testid={RoomTestId.Root} className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative flex h-40 items-center justify-between overflow-hidden bg-room px-7">
        <div className="relative z-10">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-accent">{t("room.label")}</span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">{t("room.name")}</h2>
          <p className="mt-2 text-xs text-muted">{t("room.description")}</p>
        </div>
        <div
          aria-hidden
          className={cn(
            "relative mr-6 hidden h-44 w-56 -rotate-12 items-center justify-center rounded-[45%]",
            "border-14 border-room-line/40 sm:flex",
          )}
        >
          <div className="h-28 w-44 rounded-[45%] border border-room-line bg-room shadow-xl" />
          <div className="absolute h-12 w-32 rounded-full border-2 border-room-line bg-panel/60" />
        </div>
        <ArrowUpRight size={22} className="absolute top-6 right-6 text-accent" aria-hidden />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Users size={14} aria-hidden />
            {t("room.capacity")}
          </span>
          <span className="flex items-center gap-1.5">
            <Monitor size={14} aria-hidden />
            {t("room.display")}
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi size={14} aria-hidden />
            {t("room.wifi")}
          </span>
        </div>
        <Badge tone={Tone.Success} dot>
          {t("room.available")}
        </Badge>
      </div>
    </section>
  )
}
