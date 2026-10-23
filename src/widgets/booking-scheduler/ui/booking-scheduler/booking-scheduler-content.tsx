"use client"

import { cn } from "@/shared/lib/cn"

import { CalendarCheck2, RotateCcw } from "lucide-react"
import { BookingForm } from "@/features/booking-editor"
import { DeleteBookingButton } from "@/features/delete-booking"
import { BookingCard, DaySchedule, RoomSummary } from "@/entities/booking"
import { useTranslation } from "@/shared/lib/i18n"
import { Tone, ButtonVariant } from "@/shared/config"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Feedback } from "@/shared/ui/feedback"
import { Skeleton } from "@/shared/ui/skeleton"
import { DateStrip } from "../date-strip/date-strip"
import { useBookingScheduler } from "@/widgets/booking-scheduler/model/use-booking-scheduler"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import type { BookingSchedulerProps } from "./booking-scheduler.types"

export function BookingSchedulerContent({ scenario }: BookingSchedulerProps) {
  const { t } = useTranslation()
  const model = useBookingScheduler()

  return (
    <div data-testid={SchedulerTestId.Root} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <RoomSummary />
        <DateStrip date={model.date} onSelect={model.selectDate} />
        <DaySchedule bookings={model.bookings} />
        <section data-testid={SchedulerTestId.List} className="space-y-3">
          <div className="mb-4 flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-base font-semibold">{t("booking.list.title")}</h2>
              <p className="mt-1 text-xs text-muted">{t("booking.list.subtitle")}</p>
            </div>
            <Badge>{model.bookings.length}</Badge>
          </div>
          {model.loading ? (
            <div role="status" aria-label={t("booking.feedback.loading")} className="space-y-3">
              <Skeleton className="h-23" />
              <Skeleton className="h-23" />
              <Skeleton className="h-23" />
            </div>
          ) : model.error ? (
            <div className="space-y-3">
              <Feedback
                tone={Tone.Danger}
                title={t("booking.feedback.loadError.title")}
                description={t("booking.feedback.loadError.description")}
              />
              <Button
                data-testid={SchedulerTestId.Retry}
                variant={ButtonVariant.Secondary}
                onClick={model.retry}
                icon={<RotateCcw size={14} aria-hidden />}
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : model.bookings.length ? (
            model.bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={model.edit}
                actions={<DeleteBookingButton id={booking.id} date={model.date} onDeleted={model.bookingDeleted} />}
              />
            ))
          ) : (
            <div
              data-testid={SchedulerTestId.Empty}
              className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-panel px-5", "py-10 text-center")}
            >
              <span className="mb-4 rounded-2xl bg-soft p-4 text-accent">
                <CalendarCheck2 size={24} aria-hidden />
              </span>
              <h3 className="text-sm font-semibold">{t("booking.feedback.empty.title")}</h3>
              <p className="mt-2 max-w-80 text-xs/relaxed text-muted">{t("booking.feedback.empty.description")}</p>
            </div>
          )}
        </section>
      </div>
      <aside aria-label={t(model.editing ? "booking.form.editTitle" : "booking.form.createTitle")} className="xl:sticky xl:top-6">
        <BookingForm
          key={`${model.date}-${model.editing?.id ?? "new"}`}
          date={model.date}
          bookings={model.bookings}
          editing={model.editing}
          onCancel={model.cancel}
          scenario={scenario}
        />
      </aside>
    </div>
  )
}
