import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { setupServer } from "msw/node"
import { createHandlers } from "@/_app/api/mock/handlers"
import { PreviewState } from "@/shared/config"
import { HttpStatus } from "@/shared/api"
import { BookingError } from "@/entities/booking"
import { LiveApiClock } from "./live-clock.fixtures"

const server = setupServer()
let now = new Date(LiveApiClock.initial)
const endpoint = `${LiveApiClock.origin}/bookings`

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

beforeEach(() => {
  now = new Date(LiveApiClock.initial)
  server.resetHandlers(...createHandlers(LiveApiClock.origin, PreviewState.Empty, () => now))
})

afterAll(() => server.close())

describe("mock API uses the room's current clock", () => {
  it("rejects an already elapsed same-day interval without writing it", async () => {
    const response = await fetch(endpoint, { method: "POST", body: JSON.stringify(LiveApiClock.past) })

    expect(response.status).toBe(HttpStatus.BadRequest)
    expect(await response.json()).toEqual({ code: BookingError.Past })
    expect(await (await fetch(`${endpoint}?date=${LiveApiClock.past.date}`)).json()).toEqual([])
  })

  it("validates elapsed time before simulating a concurrent conflict", async () => {
    server.resetHandlers(...createHandlers(LiveApiClock.origin, PreviewState.Conflict, () => now))

    const response = await fetch(endpoint, { method: "POST", body: JSON.stringify(LiveApiClock.past) })

    expect(response.status).toBe(HttpStatus.BadRequest)
    expect(await response.json()).toEqual({ code: BookingError.Past })
    expect(await (await fetch(`${endpoint}?date=${LiveApiClock.past.date}`)).json()).toEqual([])
  })

  it("reads time again for later writes instead of retaining the bootstrap instant", async () => {
    const first = await fetch(endpoint, { method: "POST", body: JSON.stringify(LiveApiClock.input) })

    expect(first.status).toBe(HttpStatus.Created)
    now = new Date(LiveApiClock.later)

    const second = await fetch(endpoint, { method: "POST", body: JSON.stringify(LiveApiClock.input) })

    expect(second.status).toBe(HttpStatus.BadRequest)
    expect(await second.json()).toEqual({ code: BookingError.Past })
    expect(await (await fetch(`${endpoint}?date=${LiveApiClock.input.date}`)).json()).toHaveLength(1)
  })
})
