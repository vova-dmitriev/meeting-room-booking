import { type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookingApiError, BookingError, bookingQueries, bookingApi, validateBooking } from "@/entities/booking"
import { PreviewState } from "@/shared/config"
import { clock, useClock } from "@/shared/lib/clock"
import { parseCalendarDate } from "@/shared/lib/date"
import { useTranslation } from "@/shared/lib/i18n"
import { notifySuccess } from "@/shared/ui/toast"
import type { BookingFormProps, BookingSaveRequest } from "./types"
import { getBookingValidationError } from "./errors/api-validation"
import { getBookingAvailability } from "./availability/availability"
import { cacheSavedBooking, refreshSavedBooking } from "./save/booking-cache"
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

export function useBookingEditor({ date, bookings, editing, onCancel, onSaved, scenario }: BookingFormProps) {
  const { t } = useTranslation()
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
  const now = useClock()
  const validDate = Boolean(parseCalendarDate(draft.date))
  const availability = getBookingAvailability(draft.date, now)
  const targetEnabled = validDate && draft.date !== date
  const targetDay = useQuery({ ...bookingQueries.list(draft.date), enabled: targetEnabled })
  const targetBookings = draft.date === date ? bookings : (targetDay.data ?? [])
  const checkingDate = targetEnabled && targetDay.isFetching

  const recovery = useMutation({
    mutationFn: (request: BookingSaveRequest) => refreshSavedBooking(queryClient, request),
    retry: false,
    onSuccess: () => setRefreshFailed(false),
    onError: () => setRefreshFailed(true),
  })

  const mutation = useMutation({
    mutationFn: ({ bookingId, input }: BookingSaveRequest) => (bookingId ? bookingApi.update(bookingId, input) : bookingApi.create(input)),
    retry: false,
    onSuccess: async (saved, request) => {
      setSuccess(true)
      setConflict(false)
      setError(null)
      cacheSavedBooking(queryClient, saved, request.originalDate)
      notifySuccess(t(request.bookingId ? "booking.feedback.success.updatedTitle" : "booking.feedback.success.title"))

      try {
        await refreshSavedBooking(queryClient, request)
      } catch {
        setRefreshFailed(true)
      }
    },
    onError: async (failure, request) => {
      const validationError = getBookingValidationError(failure)

      if (failure instanceof BookingApiError && failure.isConflict) {
        setConflict(true)

        try {
          await queryClient.refetchQueries(
            { queryKey: bookingQueries.list(request.input.date).queryKey, exact: true },
            { throwOnError: true },
          )
        } catch {
          setRefreshFailed(true)
        }
      } else if (validationError) {
        setError(validationError)
        setConflict(false)
        setRefreshFailed(false)
      } else {
        setRefreshFailed(true)
      }
    },
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (mutation.isPending || recovery.isPending || checkingDate) return

    if (success && mutation.variables) {
      recovery.mutate(mutation.variables)

      return
    }

    const request: BookingSaveRequest = { input: { ...draft }, originalDate: date, bookingId: editing?.id, onSaved }
    let validationBookings = targetBookings

    if (targetEnabled && targetDay.isError) {
      try {
        const refreshed = await targetDay.refetch({ throwOnError: true })

        validationBookings = refreshed.data ?? []
      } catch {
        setRefreshFailed(true)

        return
      }
    }

    setRefreshFailed(false)
    const issues = validateBooking(request.input, { bookings: validationBookings, now: clock.now(), excludeId: request.bookingId })

    if (issues.length) {
      setError(issues[0])

      return
    }

    mutation.mutate(request)
  }

  return {
    ...availability,
    unavailable: validDate && availability.unavailable,
    dateError: !validDate ? BookingError.Date : availability.unavailable ? BookingError.Past : undefined,
    draft,
    update,
    submit,
    error,
    conflict,
    refreshFailed,
    success,
    cancel: onCancel,
    pending: mutation.isPending || recovery.isPending || checkingDate || scenario === PreviewState.Sending,
    checkingDate,
  }
}
