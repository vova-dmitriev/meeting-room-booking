import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { assertFormAccessibility, expectCreatedInterval, expectFieldError, openRule } from "./workspace"

const outsideWorkday = [
  { story: "start-before-workday", field: EditorTestId.Start, boundary: "rangeUnderflow" },
  { story: "start-after-workday", field: EditorTestId.Start, boundary: "rangeOverflow" },
  { story: "end-before-workday", field: EditorTestId.End, boundary: "rangeUnderflow" },
  { story: "end-after-workday", field: EditorTestId.End, boundary: "rangeOverflow" },
] as const

for (const { story, field, boundary } of outsideWorkday) {
  test(`rejects ${story} without creating a booking`, async ({ page }) => {
    await openRule(page, `booking-time-rules--${story}`)

    await expect
      .poll(() => page.getByTestId(field).evaluate((input, key) => (input as HTMLInputElement).validity[key], boundary))
      .toBe(true)

    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
    await assertFormAccessibility(page)
  })
}

const invalidDurations = [
  { story: "equal-times", error: "booking.validation.order" },
  { story: "reversed-times", error: "booking.validation.order" },
  { story: "below-minimum", error: "booking.validation.duration" },
  { story: "above-maximum", error: "booking.validation.duration" },
] as const

for (const { story, error } of invalidDurations) {
  test(`rejects ${story} with an accessible validation message`, async ({ page }) => {
    await openRule(page, `booking-time-rules--${story}`)
    await expectFieldError(page, error)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
    await assertFormAccessibility(page)
  })
}

test("accepts exactly 30 minutes starting at workday opening", async ({ page }) => {
  await openRule(page, "booking-time-rules--minimum-duration")
  await expectCreatedInterval(page, "09:00", "09:30", 1)
  await assertFormAccessibility(page)
})

test("accepts exactly 120 minutes ending at workday closing", async ({ page }) => {
  await openRule(page, "booking-time-rules--maximum-duration")
  await expectCreatedInterval(page, "16:00", "18:00", 1)
  await assertFormAccessibility(page)
})
