export const roomTimeFixture = {
  instant: "2026-10-23T21:10:30.500Z",
  expected: { date: "2026-10-24", minutes: 10 + 30.5 / 60 },
  midnight: "2026-10-23T21:00:00.000Z",
  midnightExpected: { date: "2026-10-24", minutes: 0 },
  historical: "2012-10-23T20:00:00.000Z",
  historicalExpected: { date: "2012-10-24", minutes: 0 },
  processTimeZones: ["UTC", "America/Los_Angeles", "Asia/Yerevan"],
}
