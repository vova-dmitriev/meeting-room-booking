import type { QueryClient } from "@tanstack/react-query"
import { bookingQueries, type Booking } from "@/entities/booking"
import type { BookingSaveRequest } from "../types"

export function cacheSavedBooking(client: QueryClient, saved: Booking, originalDate: string) {
  const queryKey = bookingQueries.list(saved.date).queryKey.slice(0, 1)

  client.setQueriesData<Booking[]>({ queryKey }, (bookings) => bookings?.filter((booking) => booking.id !== saved.id))

  for (const date of new Set([originalDate, saved.date])) {
    client.setQueryData<Booking[]>(bookingQueries.list(date).queryKey, (bookings) => {
      const others = (bookings ?? []).filter((booking) => booking.id !== saved.id)

      return date === saved.date ? [...others, saved] : others
    })
  }
}

export async function refreshSavedBooking(client: QueryClient, request: BookingSaveRequest) {
  await client.invalidateQueries({ queryKey: bookingQueries.list(request.input.date).queryKey.slice(0, 1) }, { throwOnError: true })

  request.onSaved?.(request.input.date)
}
