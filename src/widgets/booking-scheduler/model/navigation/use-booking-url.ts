"use client"

import { useEffect, useRef } from "react"
import type { Booking } from "@/entities/booking"
import { clock } from "@/shared/lib/clock"
import { useCancelEditing, useStartEditing } from "../selectors"
import { bookingForSearch } from "./booking-url"

export function useBookingUrl(enabled: boolean, bookings: Booking[]) {
  const startEditing = useStartEditing()
  const cancelEditing = useCancelEditing()
  const requestedSearch = useRef<string | undefined>(undefined)
  const appliedSearch = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return

    requestedSearch.current ??= window.location.search

    const restore = () => {
      const search = requestedSearch.current

      if (search === undefined || search !== window.location.search || appliedSearch.current === search) return

      const booking = bookingForSearch(search, bookings, clock.now())

      if (!booking) return

      appliedSearch.current = search
      startEditing(booking)
    }

    const navigate = () => {
      if (appliedSearch.current !== undefined) cancelEditing()

      requestedSearch.current = window.location.search
      appliedSearch.current = undefined
      restore()
    }

    restore()
    window.addEventListener("popstate", navigate)

    return () => {
      window.removeEventListener("popstate", navigate)
    }
  }, [enabled, bookings, startEditing, cancelEditing])
}
