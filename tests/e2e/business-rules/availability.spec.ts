import { expect, test } from "@playwright/test"
import { BookingTestId, DemoDate, DayFeedTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { byIdentity } from "../bookings/workspace"
import { assertFormAccessibility, expectCreatedInterval, expectFieldError, openRule, t } from "./workspace"
import { BookingDates, BookingIdentities, BookingIntervals } from "../booking.fixtures"

test("rejects an overlap against the current schedule", async ({ page }) => {
  await openRule(page, "booking-availability-rules--overlap")
  await expectFieldError(page, "booking.validation.overlap")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("accepts a booking ending exactly when another begins", async ({ page }) => {
  await openRule(page, "booking-availability-rules--touch-before", "closed")
  await expectCreatedInterval(page, BookingIntervals.Minimum.start, BookingIntervals.Minimum.end, 4)
})

test("accepts a booking starting exactly when another ends", async ({ page }) => {
  await openRule(page, "booking-availability-rules--touch-after", "closed")
  await expectCreatedInterval(page, BookingIntervals.TouchAfter.start, BookingIntervals.TouchAfter.end, 4)
})

test("today's start and end controls reject time that has already passed", async ({ page }) => {
  await openRule(page, "booking-availability-rules--past-time")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Default.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Default.end)

  for (const field of [EditorTestId.Start, EditorTestId.End]) {
    await expect.poll(() => page.getByTestId(field).evaluate((input) => (input as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  }

  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("past dates remain viewable while creation is disabled and future dates recover", async ({ page }) => {
  await openRule(page, "booking-availability-rules--past-date", "closed")
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(BookingDates.Past)
  await expect(page.getByTestId(DayFeedTestId.Past)).toContainText(t("dayFeed.ended"))
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeDisabled()
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)

  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Tomorrow)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(BookingDates.Tomorrow)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("min", BookingIntervals.Opening.start)
  await assertFormAccessibility(page)
})

test("editing a booking preserves its own interval without self-conflict", async ({ page }) => {
  await openRule(page, "booking-availability-rules--editing-self", "closed")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  const design = await byIdentity(page.getByTestId(BookingTestId.Card), "data-booking-id", BookingIdentities.Design)

  await expect(design).toContainText(t("demo.uiKit.primaryAction"))
  await expect(design).toContainText(BookingIntervals.Design.start)
  await expect(design).toContainText(BookingIntervals.Design.end)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await design.getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(DemoDate)
  await expect(page.getByTestId(EditorTestId.Start)).not.toHaveAttribute("aria-invalid", "true")
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
})
