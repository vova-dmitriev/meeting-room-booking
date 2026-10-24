const newYearDate = "2027-01-01"
const sundayDate = "2026-11-01"

export const calendarWeekFixture = {
  crossYear: {
    selected: newYearDate,
    expected: ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", newYearDate, "2027-01-02", "2027-01-03"],
  },
  sunday: {
    selected: sundayDate,
    expected: ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", sundayDate],
  },
  invalidDates: ["", "2026-02-31", "not-a-date"],
}
