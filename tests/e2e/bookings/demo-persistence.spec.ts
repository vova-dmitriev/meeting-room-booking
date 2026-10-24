import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { PageTestId } from "@/_pages/bookings"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { fillBooking } from "./workspace"
import { BookingDates, BookingIntervals, BookingTitles } from "../booking.fixtures"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"

const fixture = {
  Origin: process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin,
  Now: "2026-10-23T08:30:00+03:00",
  Seeded: 3,
  Created: 1,
} as const

test.use({ baseURL: fixture.Origin })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(fixture.Now) })
})

test("keeps a created booking across a reload", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.Seeded)

  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Tomorrow)
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()
  await fillBooking(page, BookingTitles.Release, BookingIntervals.Default.start, BookingIntervals.Default.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.Created)
  await expect(page.getByTestId(BookingTestId.Card).first()).toContainText(BookingTitles.Release)

  await page.reload()
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(BookingDates.Tomorrow)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.Created)
  await expect(page.getByTestId(BookingTestId.Card).first()).toContainText(BookingTitles.Release)
})

test("keeps seeded bookings for a fresh visitor across a reload", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.Seeded)

  await page.reload()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.Seeded)
})
