import { afterEach, describe, expect, it } from "vitest"
import * as roomClock from "@/shared/lib/clock"
import { roomTimeFixture } from "./room-time.fixtures"

const originalTimeZone = process.env.TZ

afterEach(() => {
  if (originalTimeZone === undefined) delete process.env.TZ
  else process.env.TZ = originalTimeZone
})

describe("Moscow room time", () => {
  it.each(roomTimeFixture.processTimeZones)("uses the same room day and precise time under process TZ %s", (timeZone) => {
    process.env.TZ = timeZone

    expect(roomClock.roomTime(new Date(roomTimeFixture.instant))).toEqual(roomTimeFixture.expected)
  })

  it("starts the room day at Moscow midnight while UTC is still yesterday", () => {
    expect(roomClock.roomTime(new Date(roomTimeFixture.midnight))).toEqual(roomTimeFixture.midnightExpected)
  })

  it("uses Moscow's historical IANA offset rather than a fixed UTC offset", () => {
    expect(roomClock.roomTime(new Date(roomTimeFixture.historical))).toEqual(roomTimeFixture.historicalExpected)
  })
})
