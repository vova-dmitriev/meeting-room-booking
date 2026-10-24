import { expect, test } from "@playwright/test"
import { BookingError, BookingTestId, DayFeedTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"
import { fillBooking } from "../bookings/workspace"
import { ClockFixture } from "./clock.fixtures"
import { openClockWorkspace, t } from "./workspace"

const applicationOrigin = process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin

test.use({ baseURL: applicationOrigin, timezoneId: ClockFixture.ClientTimezone })

test("disables creation for a past Moscow date", async ({ page }) => {
  await openClockWorkspace(page)
  await page.getByTestId(SchedulerTestId.DateInput).fill(ClockFixture.Past)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeDisabled()
  await expect(page.getByTestId(DayFeedTestId.Past)).toContainText(t("dayFeed.ended"))
  await expect(page.getByTestId(DayFeedTestId.Free)).toHaveCount(ClockFixture.EmptyBookings)
})

test("rejects an elapsed start on the current Moscow day", async ({ page }) => {
  await openClockWorkspace(page)
  await fillBooking(page, t("demo.meetings.planning"), ClockFixture.PastStart, ClockFixture.PastEnd)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleDescription(t(BookingError.Past))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(ClockFixture.EmptyBookings)
})

test("updates a live open editor and revalidates its stale draft at submit", async ({ page }) => {
  await openClockWorkspace(page)
  await fillBooking(page, t("demo.meetings.planning"), ClockFixture.RoundedStart, ClockFixture.SuggestedEnd)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("min", ClockFixture.RoundedStart)
  await page.clock.setSystemTime(new Date(ClockFixture.AfterBoundary))
  await page.clock.runFor(ClockFixture.Tick)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("min", ClockFixture.NextStart)
  await expect(page.getByTestId(DayFeedTestId.Free).last()).toHaveAttribute("data-start", ClockFixture.NextStart)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(ClockFixture.RoundedStart)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleDescription(t(BookingError.Past))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(ClockFixture.EmptyBookings)
})

test("keeps the selected date across Moscow midnight and opens the new day", async ({ page }) => {
  await openClockWorkspace(page, ClockFixture.MidnightBefore)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeDisabled()
  await page.clock.setSystemTime(new Date(ClockFixture.MidnightAfter))
  await page.clock.runFor(ClockFixture.Tick)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(ClockFixture.Today)
  await expect(page.getByTestId(DayFeedTestId.Past)).toBeVisible()
  await page.getByTestId(SchedulerTestId.Next).click()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(ClockFixture.Tomorrow)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(ClockFixture.Opening)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(ClockFixture.OpeningEnd)
})
