const today = "2026-10-23"
const lastSlotStart = "17:30"
const workdayStart = "09:00"
const fixtureOffset = "+03:00"

export const availabilityFixture = {
  future: {
    date: "2026-10-24",
    now: new Date(`${today}T12:30:00${fixtureOffset}`),
    expected: { startMin: workdayStart, endMin: "09:30", unavailable: false },
  },
  elapsed: {
    date: today,
    now: new Date(`${today}T12:30:01${fixtureOffset}`),
    expected: { startMin: "12:40", endMin: "13:10", unavailable: false },
  },
  lastSlot: {
    date: today,
    now: new Date(`${today}T${lastSlotStart}:00${fixtureOffset}`),
    expected: { startMin: lastSlotStart, endMin: "18:00", unavailable: false },
  },
  afterLastSlot: { date: today, now: new Date(`${today}T${lastSlotStart}:01${fixtureOffset}`) },
  fractionalSecond: {
    date: today,
    now: new Date(`${today}T12:30:00.001${fixtureOffset}`),
    expected: { startMin: "12:40", endMin: "13:10", unavailable: false },
  },
  exactStep: {
    date: today,
    now: new Date(`${today}T12:30:00${fixtureOffset}`),
    expected: { startMin: "12:30", endMin: "13:00", unavailable: false },
  },
  past: { date: "2026-10-22", now: new Date(`${today}T00:01:00${fixtureOffset}`) },
}
