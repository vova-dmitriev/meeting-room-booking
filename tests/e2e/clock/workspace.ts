import { expect, type Page } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { BookingTestId } from "@/entities/booking"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { createI18n } from "@/shared/lib/i18n"
import { ClockFixture } from "./clock.fixtures"

export const t = createI18n().t

export async function openClockWorkspace(page: Page, now: string = ClockFixture.Now) {
  await page.clock.install({ time: new Date(now) })
  await page.goto("/")
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(ClockFixture.Today)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(ClockFixture.EmptyBookings)
}
