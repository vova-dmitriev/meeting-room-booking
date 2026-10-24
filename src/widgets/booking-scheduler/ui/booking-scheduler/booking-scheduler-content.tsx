"use client"

import { RotateCcw } from "lucide-react"
import { DayFeed } from "@/entities/booking"
import { useTranslation } from "@/shared/lib/i18n"
import { Tone, ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { Feedback } from "@/shared/ui/feedback"
import { Skeleton } from "@/shared/ui/skeleton"
import { useBookingScheduler } from "@/widgets/booking-scheduler/model/use-booking-scheduler"
import { SchedulerTestId } from "@/widgets/booking-scheduler/config/test-ids"
import { SchedulerHeader } from "../scheduler-header/scheduler-header"
import { SchedulerEditor } from "../scheduler-editor/scheduler-editor"
import type { BookingSchedulerProps } from "./booking-scheduler.types"

export function BookingSchedulerContent({ scenario }: BookingSchedulerProps) {
  const { t } = useTranslation()
  const model = useBookingScheduler()

  return (
    <div data-testid={SchedulerTestId.Root}>
      <SchedulerHeader model={model} />
      <section
        data-testid={SchedulerTestId.List}
        aria-labelledby={SchedulerTestId.Heading}
        className="mx-auto max-w-3xl py-7 sm:px-6 sm:py-8"
      >
        <h2 id={SchedulerTestId.Heading} data-testid={SchedulerTestId.Heading} className="sr-only">
          {t("dayFeed.title")}
        </h2>
        {model.loading ? (
          <div role="status" aria-label={t("booking.feedback.loading")} className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
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
        ) : (
          <div data-testid={model.bookings.length ? undefined : SchedulerTestId.Empty}>
            <DayFeed date={model.date} bookings={model.bookings} now={model.now} onSelectInterval={model.create} onEdit={model.edit} />
          </div>
        )}
      </section>
      <SchedulerEditor model={model} scenario={scenario} />
    </div>
  )
}
