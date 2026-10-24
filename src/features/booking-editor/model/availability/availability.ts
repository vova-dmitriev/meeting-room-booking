import { BookingRule } from "@/entities/booking"
import { formatMinutes, TimeUnit } from "@/shared/lib/time"
import { formatDate } from "@/shared/lib/date"

export function getBookingAvailability(date: string, now: Date) {
  const today = formatDate(now)
  const elapsedMinutes = now.getHours() * TimeUnit.MinutesPerHour + now.getMinutes() + (now.getSeconds() || now.getMilliseconds() ? 1 : 0)
  const nextStep = Math.ceil(elapsedMinutes / BookingRule.Step) * BookingRule.Step
  const firstMinute = date === today ? Math.max(BookingRule.Start, nextStep) : BookingRule.Start
  const startMin = formatMinutes(firstMinute)
  const endMin = formatMinutes(firstMinute + BookingRule.MinDuration)

  return { startMin, endMin, unavailable: date < today || firstMinute > BookingRule.End - BookingRule.MinDuration }
}
