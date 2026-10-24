import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { FeedbackTestId } from "@/shared/ui/feedback/test-ids"
import { fillBooking } from "../../bookings/workspace"
import { openRule } from "../workspace"
import { ApiValidationFixture as fixture, rejectNextWrite } from "./fixtures"

test("a server start-boundary rejection keeps the draft and displays domain validation", async ({ page }) => {
  await openRule(page, fixture.Story, "create")
  await rejectNextWrite(page)
  await fillBooking(page, fixture.Title, fixture.Start, fixture.End)
  await page.getByTestId(EditorTestId.Submit).click()

  await expect(page.getByTestId(EditorTestId.Start)).toHaveAttribute("aria-invalid", fixture.Invalid)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleDescription(fixture.Past)
  await expect(page.getByTestId(EditorTestId.TimeError)).toHaveText(fixture.Past)
  await expect(page.getByTestId(FeedbackTestId.Root)).toHaveCount(fixture.EmptyCount)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.Title)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(fixture.Start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(fixture.End)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.EmptyCount)

  await fillBooking(page, fixture.Title, fixture.RecoveryStart, fixture.RecoveryEnd)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.SavedCount)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(fixture.EmptyCount)
})

test("an unknown server code retains transport failure feedback", async ({ page }) => {
  await openRule(page, fixture.Story, "create")
  await rejectNextWrite(page, fixture.UnknownCode)
  await fillBooking(page, fixture.Title, fixture.Start, fixture.End)
  await page.getByTestId(EditorTestId.Submit).click()

  await expect(page.getByTestId(FeedbackTestId.Root)).toContainText(fixture.RefreshFailure)
  await expect(page.getByTestId(EditorTestId.TimeError)).toBeEmpty()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.Title)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(fixture.EmptyCount)
})
