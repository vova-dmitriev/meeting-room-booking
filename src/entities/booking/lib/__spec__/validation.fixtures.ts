import type { BookingInput, ValidationContext } from "../../model/types"

const futureDate = "2026-10-24"
const currentDate = "2026-10-23"
const start = "10:00"
const end = "11:00"
const halfPastNine = "09:30"
const halfPastTen = "10:30"
const closingTime = "18:00"
const offGridEnd = "10:35"

export const validationFixture = {
  input: { date: futureDate, start, end, title: "Design review" } satisfies BookingInput,
  context: { bookings: [], now: new Date(`${currentDate}T${start}:30`) } satisfies ValidationContext,
  parsedTime: { input: halfPastNine, minutes: 570 },
  malformedTime: "25:00",
  touchingInterval: { start: end, end: "12:00" },
  overlappingStart: halfPastTen,
  workingIntervals: [
    ["09:00", halfPastNine],
    ["16:00", closingTime],
  ],
  invalidIntervals: [
    ["08:59", start],
    ["17:00", "18:01"],
    [start, "10:29"],
    [start, "12:01"],
    [end, start],
  ],
  existingId: "existing",
  invalidDates: ["2026-10-22", currentDate, "2026-02-30"],
  offGridIntervals: [
    ["10:05", offGridEnd],
    [start, offGridEnd],
  ],
  fortyMinuteInterval: { start: "10:10", end: "10:50" },
}
