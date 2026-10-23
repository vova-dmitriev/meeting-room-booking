import { BookingRule } from "@/entities/booking"

function formatMinutes(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
}

export function getBookingAvailability(date: string, now: Date) {
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")
  const elapsedMinutes = now.getHours() * 60 + now.getMinutes() + (now.getSeconds() || now.getMilliseconds() ? 1 : 0)
  const nextStep = Math.ceil(elapsedMinutes / BookingRule.Step) * BookingRule.Step
  const firstMinute = date === today ? Math.max(BookingRule.Start, nextStep) : BookingRule.Start
  const startMin = formatMinutes(firstMinute)
  const endMin = formatMinutes(firstMinute + BookingRule.MinDuration)

  return { startMin, endMin, unavailable: date < today || firstMinute > BookingRule.End - BookingRule.MinDuration }
}
