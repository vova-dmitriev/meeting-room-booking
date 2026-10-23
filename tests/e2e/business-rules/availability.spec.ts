import { expect, test } from "@playwright/test"
import { BookingTestId, DemoDate } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { byIdentity } from "../bookings/workspace"
import { assertFormAccessibility, expectCreatedInterval, expectFieldError, openRule, t } from "./workspace"

test("rejects an overlap against the current schedule", async ({ page }) => {
  await openRule(page, "booking-availability-rules--overlap")
  await expectFieldError(page, "booking.validation.overlap")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("accepts a booking ending exactly when another begins", async ({ page }) => {
  await openRule(page, "booking-availability-rules--touch-before")
  await expectCreatedInterval(page, "09:00", "09:30", 4)
})

test("accepts a booking starting exactly when another ends", async ({ page }) => {
  await openRule(page, "booking-availability-rules--touch-after")
  await expectCreatedInterval(page, "10:00", "10:30", 4)
})

test("today's start and end controls reject time that has already passed", async ({ page }) => {
  await openRule(page, "booking-availability-rules--past-time")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue("10:00")
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue("11:00")

  for (const field of [EditorTestId.Start, EditorTestId.End]) {
    await expect.poll(() => page.getByTestId(field).evaluate((input) => (input as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  }

  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("past dates remain viewable while creation is disabled and future dates recover", async ({ page }) => {
  await openRule(page, "booking-availability-rules--past-date")
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue("2026-10-22")
  await expect(page.getByTestId(EditorTestId.Submit)).toBeDisabled()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveAccessibleDescription(t("booking.validation.past"))

  const tomorrow = await byIdentity(page.getByTestId(SchedulerTestId.Day), "data-date", "2026-10-24")

  await tomorrow.click()
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("min", "09:00")
  await assertFormAccessibility(page)
})

test("editing a booking preserves its own interval without self-conflict", async ({ page }) => {
  await openRule(page, "booking-availability-rules--editing-self")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)

  const design = await byIdentity(page.getByTestId(BookingTestId.Card), "data-booking-id", "design")

  await expect(design).toContainText(t("demo.uiKit.primaryAction"))
  await expect(design).toContainText("09:30")
  await expect(design).toContainText("10:00")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(DemoDate)
  await expect(page.getByTestId(EditorTestId.Start)).not.toHaveAttribute("aria-invalid", "true")
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
})
