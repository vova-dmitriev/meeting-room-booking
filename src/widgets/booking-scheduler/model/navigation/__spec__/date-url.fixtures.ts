export const dateUrlFixture = {
  now: new Date("2026-10-24T21:30:00Z"),
  today: "2026-10-25",
  selected: "2028-02-29",
  validSearch: "?source=calendar&date=2028-02-29",
  invalidSearches: ["", "?date=", "?date=2026-02-30", "?date=2027-02-29", "?date=2026-2-03", "?date=garbage"],
  original: "https://example.test/room?source=calendar&source=other&date=2026-11-03#room",
  replaced: "/room?source=calendar&source=other&date=2028-02-29#room",
  missing: "https://example.test/room?source=calendar#room",
  added: "/room?source=calendar&date=2028-02-29#room",
} as const
