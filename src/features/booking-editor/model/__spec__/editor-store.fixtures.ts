import { DemoDate, type Booking } from "@/entities/booking"
import type { BookingFormProps } from "../types"

const title = "Планирование релиза"

export const editorFixture = {
  options: { date: DemoDate, bookings: [], onCancel: () => undefined } satisfies BookingFormProps,
  initialDraft: { date: DemoDate, start: "10:00", end: "11:00", title: "" },
  booking: { id: "own", date: DemoDate, title, start: "12:00", end: "13:00" } satisfies Booking,
  title,
  changedTitle: "Изменённая встреча",
  revisedStart: "12:30",
  intervalEdits: [
    ["start", "13:00"],
    ["end", "14:00"],
    ["date", "2026-10-24"],
  ] as const,
}
