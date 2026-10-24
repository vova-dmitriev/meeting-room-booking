import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { setupServer } from "msw/node"
import { createHandlers } from "@/_app/api/mock/handlers"
import { MockStorage } from "@/_app/api/mock/config"
import { bookingApi, DemoDate, DemoNow, type BookingInput } from "@/entities/booking"
import { apiClient } from "@/shared/api"
import { PreviewState } from "@/shared/config"

const origin = "http://demo-persistence.test"
const originalBaseURL = apiClient.baseUrl
const server = setupServer()
const input: BookingInput = { date: DemoDate, start: "16:00", end: "17:00", title: "Планирование релиза" }
const storage = new Map<string, string>()

function persistedHandlers() {
  return createHandlers(origin, PreviewState.Default, () => new Date(DemoNow), { persist: true })
}

function memoryWindow() {
  return {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
    },
  }
}

beforeAll(() => {
  apiClient.baseUrl = origin
  server.listen({ onUnhandledRequest: "error" })
})

beforeEach(() => {
  storage.clear()
  vi.stubGlobal("window", memoryWindow())
  server.resetHandlers(...persistedHandlers())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(() => {
  server.close()
  apiClient.baseUrl = originalBaseURL
})

describe("persistent mock booking storage", () => {
  it("keeps user bookings across a simulated reload", async () => {
    const created = await bookingApi.create(input)

    expect(await bookingApi.list(DemoDate)).toHaveLength(4)

    server.resetHandlers(...persistedHandlers())

    const reloaded = await bookingApi.list(DemoDate)

    expect(reloaded).toHaveLength(4)
    expect(reloaded).toContainEqual(created)
  })

  it("falls back to seed bookings when storage is empty", async () => {
    expect(await bookingApi.list(DemoDate)).toHaveLength(3)
  })

  it("ignores a corrupt stored payload", async () => {
    storage.set(MockStorage.BookingsKey, "{")

    server.resetHandlers(...persistedHandlers())

    expect(await bookingApi.list(DemoDate)).toHaveLength(3)
  })
})
