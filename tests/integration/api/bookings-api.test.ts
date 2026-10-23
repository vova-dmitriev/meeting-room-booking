import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { createHandlers } from "@/_app/api/mock/handlers"
import { bookingApi, BookingApiError, DemoDate, type BookingInput } from "@/entities/booking"
import { apiClient } from "@/shared/api"
import { PreviewState } from "@/shared/config"

const origin = "http://booking-api.test"
const originalBaseURL = apiClient.baseUrl
const server = setupServer()
const input: BookingInput = { date: DemoDate, start: "10:00", end: "11:00", title: "Планирование релиза" }

beforeAll(() => {
  apiClient.baseUrl = origin
  server.listen({ onUnhandledRequest: "error" })
})

beforeEach(() => server.resetHandlers(...createHandlers(origin)))

afterAll(() => {
  server.close()
  apiClient.baseUrl = originalBaseURL
})

describe("Fetch booking API with the application MSW contract", () => {
  it("lists only the requested date in chronological order", async () => {
    const bookings = await bookingApi.list(DemoDate)

    expect(bookings.map((booking) => booking.id)).toEqual(["design", "planning", "team"])
    expect(bookings.every((booking) => booking.date === DemoDate)).toBe(true)
    expect(await bookingApi.list("2026-10-24")).toEqual([])
  })

  it("creates, edits and removes a booking through the same HTTP client", async () => {
    const created = await bookingApi.create(input)

    expect(created).toMatchObject(input)
    expect(created.id).toBeTruthy()
    expect(await bookingApi.list(DemoDate)).toHaveLength(4)

    const updatedInput = { ...input, start: "12:00", end: "13:00", title: "Обновлённый план релиза" }
    const updated = await bookingApi.update(created.id, updatedInput)

    expect(updated).toMatchObject({ ...updatedInput, id: created.id })
    expect(await bookingApi.list(DemoDate)).toContainEqual(updated)
    expect(await bookingApi.remove(created.id)).toBeUndefined()
    expect((await bookingApi.list(DemoDate)).map((booking) => booking.id)).not.toContain(created.id)
  })

  it("maps an overlapping reservation to BookingApiError with HTTP 409", async () => {
    const request = bookingApi.create({ ...input, start: "09:40", end: "10:10" })

    await expect(request).rejects.toBeInstanceOf(BookingApiError)
    await expect(request).rejects.toMatchObject({ status: 409 })
    expect(await bookingApi.list(DemoDate)).toHaveLength(3)
  })

  it("rejects edits of a deleted booking without restoring it", async () => {
    const created = await bookingApi.create(input)

    await bookingApi.remove(created.id)
    await expect(bookingApi.update(created.id, input)).rejects.toMatchObject({ status: 404 })
    expect(await bookingApi.list(DemoDate)).toHaveLength(3)
    expect((await bookingApi.list(DemoDate)).map((booking) => booking.id)).not.toContain(created.id)
  })

  it("maps invalid booking input to HTTP 400 without changing storage", async () => {
    await expect(bookingApi.create({ ...input, start: "08:00", end: "09:00" })).rejects.toMatchObject({ status: 400 })
    expect(await bookingApi.list(DemoDate)).toHaveLength(3)
  })

  it("refreshes a concurrent 409 reservation and permits a new free interval", async () => {
    server.resetHandlers(...createHandlers(origin, PreviewState.Conflict))

    await expect(bookingApi.create(input)).rejects.toMatchObject({ status: 409 })

    const refreshed = await bookingApi.list(DemoDate)

    expect(refreshed).toHaveLength(4)
    expect(refreshed).toContainEqual(expect.objectContaining({ id: "concurrent", start: input.start, end: input.end }))

    const recovered = await bookingApi.create({ ...input, start: "12:00", end: "13:00" })

    expect(recovered.title).toBe(input.title)
    expect(await bookingApi.list(DemoDate)).toHaveLength(5)
  })

  it("exposes unavailable HTTP status without retrying the transport", async () => {
    let requests = 0

    server.use(
      http.get(`${origin}/bookings`, () => {
        requests += 1

        return HttpResponse.json({ code: "UNAVAILABLE" }, { status: 503 })
      }),
    )

    await expect(bookingApi.list(DemoDate)).rejects.toMatchObject({ status: 503 })
    expect(requests).toBe(1)
  })

  it("normalizes a network failure and honors an aborted list request", async () => {
    server.use(http.get(`${origin}/bookings`, () => HttpResponse.error()))
    await expect(bookingApi.list(DemoDate)).rejects.toMatchObject({ status: 0 })

    const controller = new AbortController()

    controller.abort()
    server.resetHandlers(...createHandlers(origin))
    await expect(bookingApi.list(DemoDate, controller.signal)).rejects.toMatchObject({ name: "AbortError" })
  })
})
