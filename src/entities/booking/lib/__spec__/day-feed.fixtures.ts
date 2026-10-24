import type { Booking } from "../../model/types"

const date = "2026-10-24"
const nextDate = "2026-10-25"
const opening = "09:00"
const closing = "18:00"
const meeting: Booking = { id: "one", date, start: "10:00", end: "11:00", title: "Planning" }
const laterMeeting: Booking = { ...meeting, id: "two", start: meeting.end, end: "12:00" }
const beforeOpening = "08:59:59"
const fullDayIntervals = [{ kind: "free", start: opening, end: closing, elapsed: false, selection: { start: opening, end: meeting.start } }]
const earlyMeeting = { ...meeting, start: "08:00", end: "09:30" }
const fixtureOffset = "+03:00"

export const dayFeedFixture = {
  date,
  fixtureOffset,
  before: new Date(`2026-10-23T10:00:00${fixtureOffset}`),
  after: new Date(`${nextDate}T08:00:00${fixtureOffset}`),
  beforeWorkday: new Date(`${date}T08:30:00${fixtureOffset}`),
  meetingEnd: new Date(`${date}T${meeting.end}:00${fixtureOffset}`),
  workdayEnd: new Date(`${date}T${closing}:00${fixtureOffset}`),
  meeting,
  laterMeeting,
  nextDayMeeting: { ...meeting, date: nextDate },
  fullDayIntervals,
  chronologicalIntervals: [
    ["free", opening, meeting.start],
    ["occupied", meeting.start, meeting.end],
    ["occupied", laterMeeting.start, laterMeeting.end],
    ["free", laterMeeting.end, closing],
  ],
  pastIntervals: [{ kind: "occupied", start: meeting.start, end: meeting.end, booking: meeting, editable: false }],
  roundingCases: [
    { time: "10:10:00", start: "10:10", fullDay: false },
    { time: "10:10:01", start: "10:20", fullDay: false },
    { time: "10:10:00.001", start: "10:20", fullDay: false },
    { time: beforeOpening, start: opening, fullDay: true },
  ],
  editingCases: [
    ["09:59:59", true],
    [`${meeting.start}:00`, true],
    [`${meeting.start}:00.001`, false],
    ["10:30:00", false],
  ] as const,
  nextSelection: { start: meeting.end, end: laterMeeting.end },
  finalSlotCases: [
    ["17:30:00", { start: "17:30", end: closing }],
    ["17:30:01", null],
  ] as const,
  earlyMeeting,
  clippedEarlyInterval: { kind: "occupied", start: opening, end: earlyMeeting.end, booking: earlyMeeting },
}
