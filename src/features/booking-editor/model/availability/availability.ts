import { BookingRule } from "@/entities/booking"
import { formatMinutes } from "@/shared/lib/time"
import { roomTime } from "@/shared/lib/clock"

export function getBookingAvailability(date: string, now: Date) {
  const { date: today, minutes: elapsedMinutes } = roomTime(now)
  const nextStep = Math.ceil(elapsedMinutes / BookingRule.Step) * BookingRule.Step
  const firstMinute = date === today ? Math.max(BookingRule.Start, nextStep) : BookingRule.Start
  const startMin = formatMinutes(firstMinute)
  const endMin = formatMinutes(firstMinute + BookingRule.MinDuration)

  return { startMin, endMin, unavailable: date < today || firstMinute > BookingRule.End - BookingRule.MinDuration }
}
