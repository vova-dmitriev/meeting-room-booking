import { describe, expect, it } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { bookingQueries } from "@/entities/booking"
import { cacheSavedBooking, refreshSavedBooking } from "../booking-cache"
import { bookingCacheFixture } from "./booking-cache.fixtures"

const { original, moved, competing, competingOther, updated, other } = bookingCacheFixture

describe("confirmed booking saves", () => {
  it("updates source and previously unobserved destination caches before editor completion", async () => {
    const client = new QueryClient()
    const completedDates: string[] = []

    client.setQueryData(bookingQueries.list(original.date).queryKey, [original, other])
    cacheSavedBooking(client, moved, original.date)

    await refreshSavedBooking(client, {
      input: moved,
      originalDate: original.date,
      onSaved: (date) => {
        completedDates.push(date)
      },
    })

    expect(client.getQueryData(bookingQueries.list(original.date).queryKey)).toEqual([other])
    expect(client.getQueryData(bookingQueries.list(moved.date).queryKey)).toEqual([moved])
    expect(completedDates).toEqual([moved.date])
    client.clear()
  })

  it("replaces a booking on its existing date without duplicating it", () => {
    const client = new QueryClient()

    client.setQueryData(bookingQueries.list(original.date).queryKey, [original, other])
    cacheSavedBooking(client, updated, original.date)
    expect(client.getQueryData(bookingQueries.list(original.date).queryKey)).toEqual([other, updated])
    client.clear()
  })

  it("removes an older session's booking from a newer session's destination when the older save finishes last", async () => {
    const client = new QueryClient()
    const competingKey = bookingQueries.list(competing.date).queryKey

    client.setQueryData(bookingQueries.list(original.date).queryKey, [original, other])
    client.setQueryData(competingKey, [competingOther])
    cacheSavedBooking(client, competing, original.date)
    cacheSavedBooking(client, moved, original.date)

    expect(client.getQueryData(competingKey)).toEqual([competingOther])
    expect(client.getQueryData(bookingQueries.list(moved.date).queryKey)).toEqual([moved])

    await refreshSavedBooking(client, { input: moved, originalDate: original.date })

    expect(client.getQueryState(competingKey)?.isInvalidated).toBe(true)
    client.clear()
  })

  it("marks another session's destination stale when refreshing a confirmed save", async () => {
    const client = new QueryClient()
    const competingKey = bookingQueries.list(competing.date).queryKey

    client.setQueryData(competingKey, [competing])
    await refreshSavedBooking(client, { input: moved, originalDate: original.date })

    expect(client.getQueryState(competingKey)?.isInvalidated).toBe(true)
    client.clear()
  })
})
