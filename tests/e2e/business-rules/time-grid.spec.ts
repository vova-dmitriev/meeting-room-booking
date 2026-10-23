import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { fillBooking, openWorkspace } from "../bookings/workspace"
import { openRule, t } from "./workspace"

test("time controls use a ten-minute grid and application validation", async ({ page }) => {
  await openWorkspace(page)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveAttribute("novalidate", "")

  for (const field of [EditorTestId.Start, EditorTestId.End]) {
    await expect(page.getByTestId(field)).toHaveAttribute("step", "600")
  }

  await fillBooking(page, t("demo.meetings.planning"), "10:10", "10:50")
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
})

test("elapsed time shows the Russian field error instead of a browser validation popup", async ({ page }) => {
  await openRule(page, "booking-availability-rules--past-time")
  await expect(page.getByTestId(EditorTestId.Form)).toHaveAttribute("novalidate", "")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleDescription(t("booking.validation.past"))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("off-grid times receive the translated application error", async ({ page }) => {
  await openRule(page, "booking-time-rules--off-step")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleDescription(t("booking.validation.step"))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
})
