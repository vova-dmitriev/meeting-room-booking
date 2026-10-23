export function parseTime(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
  const [hours, minutes] = value.split(":").map(Number)

  return hours * 60 + minutes
}
