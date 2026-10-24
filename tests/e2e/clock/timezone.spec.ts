import { expect, test } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { BookingTestId, DayFeedTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"
import { BrowserTimezones, ClockFixture } from "./clock.fixtures"

const applicationOrigin = process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin

test.use({ baseURL: applicationOrigin })

for (const timezoneId of BrowserTimezones) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId })

    test("uses Moscow date and available starts across browser timezones", async ({ page }) => {
      await page.clock.install({ time: new Date(ClockFixture.Now) })
      await page.goto("/")
      await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
      await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(ClockFixture.Today)
      await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(ClockFixture.EmptyBookings)
      await expect(page.getByTestId(DayFeedTestId.Free).last()).toHaveAttribute("data-start", ClockFixture.RoundedStart)
      await page.getByTestId(DayFeedTestId.Free).last().click()
      await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(ClockFixture.RoundedStart)
      await expect(page.getByTestId(EditorTestId.End)).toHaveValue(ClockFixture.SuggestedEnd)
      await page.clock.setSystemTime(new Date(ClockFixture.EarlyToday))
      await page.reload()
      await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(ClockFixture.Today)
      await expect(page.getByTestId(DayFeedTestId.Free)).toHaveAttribute("data-start", ClockFixture.Opening)
      await page.getByTestId(SchedulerTestId.Create).click()
      await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(ClockFixture.Opening)
    })
  })
}
