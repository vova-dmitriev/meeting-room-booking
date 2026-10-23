import { createI18n } from "@/shared/lib/i18n"
import { DemoDate, type Booking } from "@/entities/booking"

const t = createI18n().t

export const seedBookings: Booking[] = [
  {
    id: "design",
    date: DemoDate,
    start: "09:30",
    end: "10:00",
    title: t("demo.meetings.designReview"),
    host: t("demo.meetings.hostOne"),
    people: 4,
  },
  {
    id: "planning",
    date: DemoDate,
    start: "11:00",
    end: "12:00",
    title: t("demo.meetings.planning"),
    host: t("demo.meetings.hostTwo"),
    people: 6,
  },
  {
    id: "team",
    date: DemoDate,
    start: "14:00",
    end: "15:00",
    title: t("demo.meetings.interview"),
    host: t("demo.meetings.hostThree"),
    people: 3,
  },
]
