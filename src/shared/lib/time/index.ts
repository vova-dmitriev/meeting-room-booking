export const TimeUnit = { MinutesPerHour: 60, SecondsPerMinute: 60, MillisecondsPerMinute: 60_000 } as const

const TimeFormat = { Padding: 2, Zero: "0" } as const

export function formatMinutes(minutes: number): string {
  const hours = String(Math.floor(minutes / TimeUnit.MinutesPerHour)).padStart(TimeFormat.Padding, TimeFormat.Zero)
  const remainder = String(minutes % TimeUnit.MinutesPerHour).padStart(TimeFormat.Padding, TimeFormat.Zero)

  return `${hours}:${remainder}`
}
