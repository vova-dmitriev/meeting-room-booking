import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { setupServer } from "msw/node"
import { createHandlers } from "@/_app/api/mock/handlers"
import { DemoNow, type Booking } from "@/entities/booking"
import { HttpStatus } from "@/shared/api"
import { PreviewState } from "@/shared/config"
import { MalformedApi } from "./malformed-input.fixtures"

const server = setupServer()
const bookingsUrl = `${MalformedApi.origin}/bookings`
const headers = { "Content-Type": "application/json" }

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
beforeEach(() => server.resetHandlers(...createHandlers(MalformedApi.origin, PreviewState.Empty, () => new Date(DemoNow))))
afterAll(() => server.close())

async function listBookings() {
  const response = await fetch(`${bookingsUrl}?${new URLSearchParams({ date: MalformedApi.input.date })}`)

  return response.json()
}

describe("mock booking input boundary", () => {
  it.each(MalformedApi.cases)("rejects POST $name without creating a booking", async ({ body }) => {
    const response = await fetch(bookingsUrl, { method: "POST", headers, body })

    expect(response.status).toBe(HttpStatus.BadRequest)
    expect(await response.json()).toEqual({ code: MalformedApi.errorCode })
    expect(await listBookings()).toEqual([])
  })

  it.each(MalformedApi.cases)("rejects PATCH $name without changing the booking", async ({ body }) => {
    const createdResponse = await fetch(bookingsUrl, { method: "POST", headers, body: JSON.stringify(MalformedApi.input) })
    const created = (await createdResponse.json()) as Booking
    const response = await fetch(`${bookingsUrl}/${created.id}`, { method: "PATCH", headers, body })

    expect(response.status).toBe(HttpStatus.BadRequest)
    expect(await response.json()).toEqual({ code: MalformedApi.errorCode })
    expect(await listBookings()).toEqual([created])
  })
})
