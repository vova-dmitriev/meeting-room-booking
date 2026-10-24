import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { BookingTime, bookingQueries, getDayFeed } from "@/entities/booking"
import { clock } from "@/shared/lib/clock"
import { useTheme } from "@/shared/lib/theme"
import { useBookingDeleted, useCancelEditing, useEditingBooking, useSelectDate, useSelectedDate, useStartEditing } from "./selectors"
import { useCompleteEditor, useCreateBooking, useEditorOpen, useEditorSession, useInitialInterval } from "./selectors"

export function useBookingScheduler() {
  const date = useSelectedDate()
  const editing = useEditingBooking()
  const selectDate = useSelectDate()
  const edit = useStartEditing()
  const cancel = useCancelEditing()
  const bookingDeleted = useBookingDeleted()
  const query = useQuery(bookingQueries.list(date))
  const refetch = query.refetch
  const editorOpen = useEditorOpen()
  const interval = useInitialInterval()
  const createBooking = useCreateBooking()
  const editorSession = useEditorSession()
  const completeEditor = useCompleteEditor()
  const now = clock.now()
  const unavailable = new Date(`${date}T${BookingTime.LastStart}:00`) < now
  const { toggle: toggleTheme } = useTheme()

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  const complete = useCallback(
    (savedDate: string) => {
      completeEditor(editorSession, savedDate)
    },
    [completeEditor, editorSession],
  )

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
    now,
    unavailable,
    editorOpen,
    interval,
    editorSession,
    complete,
    toggleTheme,
    create: (start?: string, end?: string) => {
      if (unavailable) return
      const firstFree = getDayFeed(date, query.data ?? [], now).intervals.find((interval) => interval.kind === "free" && interval.selection)
      const selection = firstFree?.kind === "free" ? firstFree.selection : undefined

      createBooking(start ?? selection?.start, end ?? selection?.end)
    },
  }
}
