import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookingQueries, bookingApi } from "@/entities/booking"
import { useTranslation } from "@/shared/lib/i18n"
import { notifySuccess } from "@/shared/ui/toast"
import type { DeleteBookingProps } from "./types"

export function useDeleteBooking({ id, date, onDeleted }: DeleteBookingProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: () => bookingApi.remove(id),
    retry: false,
    onSuccess: () => {
      notifySuccess(t("booking.delete.success"))
      setConfirming(false)
      onDeleted?.(id)

      return queryClient.invalidateQueries({ queryKey: bookingQueries.list(date).queryKey })
    },
  })

  return {
    confirming,
    pending: mutation.isPending,
    error: mutation.isError,
    changeOpen: (open: boolean) => {
      if (mutation.isPending) return
      mutation.reset()
      setConfirming(open)
    },
    confirm: () => mutation.mutate(),
  }
}
