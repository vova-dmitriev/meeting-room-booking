import { apiClient } from "@/shared/api"
import type { Booking, BookingInput } from "../model/types"

export { ApiError as BookingApiError } from "@/shared/api"

export const bookingApi = {
  list: (date: string, signal?: AbortSignal) => apiClient.request<Booking[]>(`/bookings?${new URLSearchParams({ date })}`, { signal }),
  create: (input: BookingInput) => apiClient.request<Booking>("/bookings", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: BookingInput) =>
    apiClient.request<Booking>(`/bookings/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => apiClient.request<void>(`/bookings/${encodeURIComponent(id)}`, { method: "DELETE" }),
}
