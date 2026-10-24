import { TimeUnit } from "@/shared/lib/time"

const RoomTimeZone = "Europe/Moscow"

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: RoomTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

export function roomTime(now: Date): { date: string; minutes: number } {
  const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]))

  const minutes =
    Number(parts.hour) * TimeUnit.MinutesPerHour +
    Number(parts.minute) +
    Number(parts.second) / TimeUnit.SecondsPerMinute +
    now.getUTCMilliseconds() / TimeUnit.MillisecondsPerMinute

  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes }
}
