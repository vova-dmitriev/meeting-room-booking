import { ButtonVariant } from "@/shared/config"
import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"
import { Pencil, Users } from "lucide-react"
import { useTranslation } from "@/shared/lib/i18n"
import { BookingTestId } from "@/entities/booking/config/booking-values"
import type { BookingCardProps } from "./booking-card.types"

export function BookingCard({ booking, onEdit, actions }: BookingCardProps) {
  const { t } = useTranslation()

  return (
    <article
      data-testid={BookingTestId.Card}
      data-booking-id={booking.id}
      className={cn("group flex items-center gap-4 rounded-xl border border-line bg-panel p-4", "transition-colors hover:bg-canvas")}
    >
      <div className="w-20 shrink-0 border-r border-line pr-3">
        <p className="text-sm font-semibold tabular-nums">{booking.start}</p>
        <p className="mt-1 text-xs text-muted tabular-nums">{booking.end}</p>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{booking.title || t("booking.list.untitled")}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>{booking.host || t("demo.meetings.hostThree")}</span>
          <span className="flex items-center gap-1">
            <Users size={12} aria-hidden />
            {t("booking.list.people", { count: booking.people || 2 })}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant={ButtonVariant.Ghost}
          data-testid={BookingTestId.Edit}
          onClick={() => onEdit(booking)}
          aria-label={t("common.edit")}
          className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-ink"
        >
          <Pencil size={15} aria-hidden />
        </Button>
        {actions}
      </div>
    </article>
  )
}
