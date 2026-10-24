import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clock } from "@/shared/lib/clock"
import { clockStore } from "../clock-store"
import { clockStoreFixture as fixture } from "./clock-store.fixtures"

const cleanups: (() => void)[] = []
let windowEvents: EventTarget
let documentEvents: EventTarget

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(fixture.initial))
  windowEvents = new EventTarget()
  documentEvents = new EventTarget()
  vi.stubGlobal("window", windowEvents)
  vi.stubGlobal("document", documentEvents)
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()

  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("live clock subscription", () => {
  it("publishes real time within one second and retains the snapshot between updates", () => {
    const observed: Date[] = []

    cleanups.push(
      clockStore.subscribe(() => {
        observed.push(clockStore.getSnapshot())
      }),
    )

    const initial = clockStore.getSnapshot()

    expect(initial.toISOString()).toBe(fixture.initial)
    expect(clockStore.getSnapshot()).toBe(initial)

    vi.advanceTimersByTime(fixture.tick)

    expect(clockStore.getSnapshot().toISOString()).toBe(fixture.next)
    expect(observed.at(-1)?.toISOString()).toBe(fixture.next)
  })

  it.each(["focus", "visibilitychange"])("refreshes immediately after %s without waiting for a tick", (event) => {
    cleanups.push(clockStore.subscribe(() => {}))
    vi.setSystemTime(new Date(fixture.resumed))

    const target = event === "focus" ? windowEvents : documentEvents

    target.dispatchEvent(new Event(event))

    expect(clockStore.getSnapshot().toISOString()).toBe(fixture.resumed)
  })

  it("honors isolated clock overrides without notifying when their instant is unchanged", () => {
    vi.spyOn(clock, "now").mockImplementation(() => {
      return new Date(fixture.override)
    })

    const observed: Date[] = []

    cleanups.push(
      clockStore.subscribe(() => {
        observed.push(clockStore.getSnapshot())
      }),
    )

    const initial = clockStore.getSnapshot()
    const updateCount = observed.length

    expect(initial.toISOString()).toBe(fixture.override)

    vi.advanceTimersByTime(fixture.tick)

    expect(clockStore.getSnapshot()).toBe(initial)
    expect(observed).toHaveLength(updateCount)
  })

  it("shares one timer and removes timer and event subscriptions after the final subscriber leaves", () => {
    const unsubscribeFirst = clockStore.subscribe(() => {})
    const unsubscribeLast = clockStore.subscribe(() => {})

    cleanups.push(unsubscribeFirst, unsubscribeLast)
    expect(vi.getTimerCount()).toBe(1)

    unsubscribeFirst()
    vi.advanceTimersByTime(fixture.tick)
    expect(clockStore.getSnapshot().toISOString()).toBe(fixture.next)

    unsubscribeLast()
    const stopped = clockStore.getSnapshot()

    expect(vi.getTimerCount()).toBe(0)
    vi.setSystemTime(new Date(fixture.resumed))
    windowEvents.dispatchEvent(new Event("focus"))
    documentEvents.dispatchEvent(new Event("visibilitychange"))
    expect(clockStore.getSnapshot()).toBe(stopped)
  })
})
