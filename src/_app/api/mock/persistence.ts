import { parseTime, type Booking } from "@/entities/booking"
import { parseCalendarDate } from "@/shared/lib/date"
import { MockStorage } from "./config"

interface StoredBookings {
  version: number
  bookings: Booking[]
}

function isBooking(value: unknown): value is Booking {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false
  if (!("id" in value) || typeof value.id !== "string") return false
  if (!("date" in value) || typeof value.date !== "string" || !parseCalendarDate(value.date)) return false
  if (!("start" in value) || typeof value.start !== "string" || parseTime(value.start) === null) return false
  if (!("end" in value) || typeof value.end !== "string" || parseTime(value.end) === null) return false
  if ("title" in value && typeof value.title !== "string") return false
  if ("host" in value && typeof value.host !== "string") return false
  if ("people" in value && (typeof value.people !== "number" || !Number.isFinite(value.people))) return false

  return true
}

function parseStoredBookings(raw: string): Booking[] | undefined {
  try {
    const value: unknown = JSON.parse(raw)

    if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined
    if (!("version" in value) || value.version !== MockStorage.Version) return undefined
    if (!("bookings" in value) || !Array.isArray(value.bookings)) return undefined

    return value.bookings.every(isBooking) ? value.bookings : undefined
  } catch {
    return undefined
  }
}

export function loadStoredBookings(storage?: Pick<Storage, "getItem">): Booking[] | undefined {
  try {
    const raw = (storage ?? window.localStorage).getItem(MockStorage.BookingsKey)

    return raw ? parseStoredBookings(raw) : undefined
  } catch {
    return undefined
  }
}

export function persistBookings(bookings: Booking[], storage?: Pick<Storage, "setItem">): void {
  const envelope: StoredBookings = { version: MockStorage.Version, bookings }

  try {
    const target = storage ?? window.localStorage

    target.setItem(MockStorage.BookingsKey, JSON.stringify(envelope))
  } catch {}
}
