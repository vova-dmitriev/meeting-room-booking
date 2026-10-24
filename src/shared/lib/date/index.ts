const Calendar = { WeekLength: 7, SundayOffset: 6, Padding: 2, Zero: "0", Anchor: "T12:00:00" } as const

function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(Calendar.Padding, Calendar.Zero),
    String(date.getDate()).padStart(Calendar.Padding, Calendar.Zero),
  ].join("-")
}

export function parseCalendarDate(value: string): Date | null {
  const date = new Date(`${value}${Calendar.Anchor}`)

  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && formatDate(date) === value ? date : null
}

export function calendarWeek(value: string): string[] {
  const selected = parseCalendarDate(value)

  if (!selected) return []

  selected.setDate(selected.getDate() - ((selected.getDay() + Calendar.SundayOffset) % Calendar.WeekLength))

  return Array.from({ length: Calendar.WeekLength }, (_, index) => {
    const day = new Date(selected)

    day.setDate(day.getDate() + index)

    return formatDate(day)
  })
}

export function shiftDate(value: string, offset: number): string {
  const date = new Date(`${value}${Calendar.Anchor}`)

  date.setDate(date.getDate() + offset)

  return formatDate(date)
}
