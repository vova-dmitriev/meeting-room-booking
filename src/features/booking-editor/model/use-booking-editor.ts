import { type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BookingApiError, bookingQueries, bookingApi, validateBooking } from "@/entities/booking"
import { PreviewState } from "@/shared/config"
import { clock } from "@/shared/lib/clock"
import type { BookingFormProps } from "./types"
import { getBookingAvailability } from "./availability/availability"
import {
  useBookingDraft,
  useEditorConflict,
  useEditorError,
  useEditorRefreshFailed,
  useEditorSuccess,
  useSetEditorConflict,
  useSetEditorError,
  useSetEditorRefreshFailed,
  useSetEditorSuccess,
  useUpdateDraft,
} from "./selectors"

export function useBookingEditor({ date, bookings, editing, onCancel, scenario }: BookingFormProps) {
  const queryClient = useQueryClient()
  const draft = useBookingDraft()
  const error = useEditorError()
  const conflict = useEditorConflict()
  const refreshFailed = useEditorRefreshFailed()
  const success = useEditorSuccess()
  const update = useUpdateDraft()
  const setError = useSetEditorError()
  const setConflict = useSetEditorConflict()
  const setRefreshFailed = useSetEditorRefreshFailed()
  const setSuccess = useSetEditorSuccess()

  const mutation = useMutation({
    mutationFn: () => (editing ? bookingApi.update(editing.id, { ...draft, date }) : bookingApi.create({ ...draft, date })),
    retry: false,
    onSuccess: async () => {
      setSuccess(true)
      setConflict(false)
      setError(null)

      try {
        await queryClient.invalidateQueries({ queryKey: bookingQueries.list(date).queryKey }, { throwOnError: true })
      } catch {
        setRefreshFailed(true)
      }
    },
    onError: async (failure) => {
      if (failure instanceof BookingApiError && failure.status === 409) {
        setConflict(true)

        try {
          await queryClient.refetchQueries({ queryKey: bookingQueries.list(date).queryKey, exact: true }, { throwOnError: true })
        } catch {
          setRefreshFailed(true)
        }
      } else {
        setRefreshFailed(true)
      }
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending) return
    const issues = validateBooking({ ...draft, date }, { bookings, now: clock.now(), excludeId: editing?.id })

    if (issues.length) {
      setError(issues[0])

      return
    }

    setRefreshFailed(false)
    mutation.mutate()
  }

  return {
    ...getBookingAvailability(date, clock.now()),
    draft,
    update,
    submit,
    error,
    conflict,
    refreshFailed,
    success,
    cancel: onCancel,
    pending: mutation.isPending || scenario === PreviewState.Sending,
  }
}
