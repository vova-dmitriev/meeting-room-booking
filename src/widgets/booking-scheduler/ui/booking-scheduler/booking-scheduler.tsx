"use client"

import { SchedulerProvider } from "../scheduler-provider/scheduler-provider"
import { BookingSchedulerContent } from "./booking-scheduler-content"
import type { BookingSchedulerProps } from "./booking-scheduler.types"

export function BookingScheduler(props: BookingSchedulerProps) {
  return (
    <SchedulerProvider>
      <BookingSchedulerContent {...props} />
    </SchedulerProvider>
  )
}
