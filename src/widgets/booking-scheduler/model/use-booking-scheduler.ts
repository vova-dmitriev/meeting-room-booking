import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { bookingQueries } from "@/entities/booking"
import { useBookingDeleted, useCancelEditing, useEditingBooking, useSelectDate, useSelectedDate, useStartEditing } from "./selectors"

export function useBookingScheduler() {
  const date = useSelectedDate()
  const editing = useEditingBooking()
  const selectDate = useSelectDate()
  const edit = useStartEditing()
  const cancel = useCancelEditing()
  const bookingDeleted = useBookingDeleted()
  const query = useQuery(bookingQueries.list(date))
  const refetch = query.refetch

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    date,
    selectDate,
    editing,
    edit,
    cancel,
    bookingDeleted,
    bookings: query.data ?? [],
    loading: query.isPending,
    error: query.isError,
    retry,
  }
}
