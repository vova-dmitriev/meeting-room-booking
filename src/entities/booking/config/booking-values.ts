export const BookingError = {
  Date: "booking.validation.date",
  Time: "booking.validation.workday",
  Order: "booking.validation.order",
  Duration: "booking.validation.duration",
  Step: "booking.validation.step",
  Past: "booking.validation.past",
  Conflict: "booking.validation.overlap",
} as const

export type BookingError = (typeof BookingError)[keyof typeof BookingError]

export const BookingRule = { Start: 540, End: 1080, MinDuration: 30, MaxDuration: 120, Step: 10 } as const

export const BookingTestId = {
  Card: "booking-card",
  Edit: "booking-edit",
  Delete: "booking-delete",
  Schedule: "booking-schedule",
  Timeline: "booking-timeline",
  Slot: "booking-slot",
} as const

export const DemoDate = "2026-10-23"

export const DemoNow = "2026-10-23T08:30:00"
