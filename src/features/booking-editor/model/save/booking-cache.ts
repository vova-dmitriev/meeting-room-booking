import type { QueryClient } from "@tanstack/react-query"
import { bookingQueries, type Booking } from "@/entities/booking"
import type { BookingSaveRequest } from "../types"

export function cacheSavedBooking(client: QueryClient, saved: Booking, originalDate: string) {
  for (const date of new Set([originalDate, saved.date])) {
    client.setQueryData<Booking[]>(bookingQueries.list(date).queryKey, (bookings) => {
      const others = (bookings ?? []).filter((booking) => booking.id !== saved.id)

      return date === saved.date ? [...others, saved] : others
    })
  }
}

export async function refreshSavedBooking(client: QueryClient, request: BookingSaveRequest) {
  await Promise.all(
    [...new Set([request.originalDate, request.input.date])].map((date) =>
      client.invalidateQueries({ queryKey: bookingQueries.list(date).queryKey }, { throwOnError: true }),
    ),
  )

  request.onSaved?.(request.input.date)
}
