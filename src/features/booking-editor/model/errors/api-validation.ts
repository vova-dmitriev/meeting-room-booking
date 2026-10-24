import { BookingApiError, BookingError } from "@/entities/booking"

export function getBookingValidationError(failure: unknown): BookingError | null {
  if (!(failure instanceof BookingApiError)) return null

  return Object.values(BookingError).find((code) => code === failure.code) ?? null
}
