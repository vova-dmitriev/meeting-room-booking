import { DemoDate, type Booking } from "@/entities/booking"

const booking: Booking = { id: "own", date: DemoDate, title: "Планирование релиза", start: "10:00", end: "11:00" }

export const schedulerFixture = {
  booking,
  otherBooking: { ...booking, id: "other" },
  nextDate: "2026-10-24",
}
