import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingQueries, bookingApi } from "@/entities/booking"
import type { DeleteBookingProps } from "./types"

export function useDeleteBooking({ id, date, onDeleted }: DeleteBookingProps) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: () => bookingApi.remove(id),
    retry: false,
    onSuccess: () => {
      onDeleted?.(id)

      return queryClient.invalidateQueries({ queryKey: bookingQueries.list(date).queryKey })
    },
  })

  return {
    confirming,
    pending: mutation.isPending,
    error: mutation.isError,
    request: () => setConfirming(true),
    cancel: () => setConfirming(false),
    confirm: () => mutation.mutate(),
  }
}
