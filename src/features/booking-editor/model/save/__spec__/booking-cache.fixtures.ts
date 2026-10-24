import { DemoDate, type Booking } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t
const original: Booking = { id: "saved-booking", date: DemoDate, start: "12:00", end: "13:00", title: t("demo.meetings.planning") }

export const bookingCacheFixture = {
  original,
  moved: { ...original, date: "2026-11-02" },
  competing: { ...original, date: "2026-11-03" },
  competingOther: { ...original, id: "competing-day-other", date: "2026-11-03", start: "14:00", end: "15:00" },
  updated: { ...original, title: t("demo.uiKit.primaryAction") },
  other: { ...original, id: "another-booking", start: "14:00", end: "15:00" },
}
