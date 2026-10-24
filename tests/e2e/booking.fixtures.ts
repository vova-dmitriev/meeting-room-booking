export const BookingDates = {
  Past: "2026-10-22",
  Tomorrow: "2026-10-24",
  Arbitrary: "2026-11-02",
  Following: "2026-11-03",
} as const

export const BookingIntervals = {
  Default: { start: "10:00", end: "11:00" },
  Grid: { start: "10:10", end: "10:50" },
  Recovery: { start: "12:00", end: "13:00" },
  Opening: { start: "09:00", end: "10:00" },
  Minimum: { start: "09:00", end: "09:30" },
  Maximum: { start: "16:00", end: "18:00" },
  TouchAfter: { start: "10:00", end: "10:30" },
  Design: { start: "09:30", end: "10:00" },
} as const

export const BookingTitles = {
  Release: "Планирование релиза",
  UpdatedRelease: "Уточнённый план релиза",
  ConflictRecovery: "Планирование после конфликта",
  Unsaved: "Несохранённые изменения",
  Empty: "",
} as const

export const BookingIdentities = { Design: "design", Concurrent: "concurrent" } as const

export const WorkdayIntervalLabel = `${BookingIntervals.Opening.start}–${BookingIntervals.Maximum.end}`

export const SelectTimeValue = BookingIntervals.TouchAfter.end
