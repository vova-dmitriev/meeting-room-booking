import type { BookingInput } from "@/entities/booking"

export async function parseBookingRequest(request: Request): Promise<BookingInput | null> {
  let value: unknown

  try {
    value = await request.json()
  } catch {
    return null
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  if (!("date" in value) || typeof value.date !== "string") return null
  if (!("start" in value) || typeof value.start !== "string") return null
  if (!("end" in value) || typeof value.end !== "string") return null
  const input = { date: value.date, start: value.start, end: value.end }

  if (!("title" in value)) return input

  return typeof value.title === "string" ? { ...input, title: value.title } : null
}
