import { queryOptions } from "@tanstack/react-query"
import { bookingApi } from "./bookings-api"

const QueryKey = { Bookings: "bookings" } as const

export const bookingQueries = {
  list: (date: string) =>
    queryOptions({ queryKey: [QueryKey.Bookings, date], queryFn: ({ signal }) => bookingApi.list(date, signal), retry: false }),
}
