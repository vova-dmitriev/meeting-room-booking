import { afterEach, describe, expect, it, vi } from "vitest"
import { MockStorage } from "../config"
import { loadStoredBookings, persistBookings } from "../persistence"

const storageFixture = {
  key: MockStorage.BookingsKey,
  booking: { id: "one", date: "2026-10-23", start: "10:00", end: "11:00", title: "Планирование релиза" },
  envelope: (bookings: unknown) => JSON.stringify({ version: MockStorage.Version, bookings }),
  invalidRecords: [
    { date: "2026-02-30" },
    { start: "25:00" },
    { end: "10:99" },
    { title: { text: "Invalid title" } },
    { host: ["Invalid host"] },
    { people: "2" },
    { people: null },
  ],
  infinitePeople: '{"id":"one","date":"2026-10-23","start":"10:00","end":"11:00","people":1e999}',
}

afterEach(() => vi.unstubAllGlobals())

function memoryStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial))

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
  }
}

describe("mock booking persistence", () => {
  it("round-trips bookings through the versioned envelope", () => {
    const storage = memoryStorage()

    persistBookings([storageFixture.booking], storage)

    expect(loadStoredBookings(storage)).toEqual([storageFixture.booking])
  })

  it.each([
    ["missing key", {}],
    ["malformed JSON", { [storageFixture.key]: "{" }],
    ["non-object payload", { [storageFixture.key]: "[]" }],
    ["unknown version", { [storageFixture.key]: JSON.stringify({ version: 99, bookings: [] }) }],
    ["missing bookings list", { [storageFixture.key]: JSON.stringify({ version: MockStorage.Version }) }],
    ["invalid booking entries", { [storageFixture.key]: storageFixture.envelope([{ id: "one" }]) }],
  ])("recovers from %s", (_name, initial) => {
    expect(loadStoredBookings(memoryStorage(initial))).toBeUndefined()
  })

  it("survives a throwing storage without spreading the failure", () => {
    persistBookings([storageFixture.booking], {
      setItem: () => {
        throw new Error("Storage full")
      },
    })

    expect(loadStoredBookings(memoryStorage())).toBeUndefined()
  })

  it.each(storageFixture.invalidRecords)("rejects malformed booking fields: %j", (invalid) => {
    const records = [storageFixture.booking, { ...storageFixture.booking, ...invalid }]
    const storage = memoryStorage({ [storageFixture.key]: storageFixture.envelope(records) })

    expect(loadStoredBookings(storage)).toBeUndefined()
  })

  it("keeps past bookings and valid optional fields", () => {
    const booking = { ...storageFixture.booking, host: "Host", people: 2 }
    const storage = memoryStorage({ [storageFixture.key]: storageFixture.envelope([booking]) })

    expect(loadStoredBookings(storage)).toEqual([booking])
  })

  it("rejects a numeric people value that parses to infinity", () => {
    const raw = `{"version":${MockStorage.Version},"bookings":[${storageFixture.infinitePeople}]}`

    expect(loadStoredBookings(memoryStorage({ [storageFixture.key]: raw }))).toBeUndefined()
  })

  it("recovers when reading storage throws", () => {
    expect(
      loadStoredBookings({
        getItem: () => {
          throw new Error("Storage denied")
        },
      }),
    ).toBeUndefined()
  })

  it.each(["read", "write"])("survives a denied localStorage getter during %s", (operation) => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("Storage denied")
      },
    })

    if (operation === "read") expect(loadStoredBookings()).toBeUndefined()
    else expect(() => persistBookings([storageFixture.booking])).not.toThrow()
  })

  it.each(["read", "write"])("survives an absent window during %s", (operation) => {
    vi.stubGlobal("window", undefined)

    if (operation === "read") expect(loadStoredBookings()).toBeUndefined()
    else expect(() => persistBookings([storageFixture.booking])).not.toThrow()
  })
})
