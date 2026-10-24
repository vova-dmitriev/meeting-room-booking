import { expect, test } from "@playwright/test"
import { BookingTestId, DayFeedTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { SkeletonTestId } from "@/shared/ui/skeleton/test-ids"
import { FeedbackTestId } from "@/shared/ui/feedback/test-ids"
import { DialogTestId } from "@/shared/ui/dialog"
import { expectNoHorizontalOverflow } from "../bookings/workspace"
import { assertFormAccessibility, openRule, t } from "./workspace"

test("loading displays placeholders while the editor remains accessible", async ({ page }) => {
  await openRule(page, "preview-booking-workspace--loading", "create")
  await expect(page.getByTestId(SkeletonTestId.Root)).toHaveCount(3)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await assertFormAccessibility(page)
})

test("empty data shows the empty state with a usable accessible editor", async ({ page }) => {
  await openRule(page, "preview-booking-workspace--empty", "create")
  await expect(page.getByTestId(DayFeedTestId.FullDay)).toBeVisible()
  await expect(page.getByTestId(DayFeedTestId.FullDay)).toContainText(t("dayFeed.fullDay"))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await assertFormAccessibility(page)
})

test("list errors announce the failure and offer a keyboard-accessible retry", async ({ page }) => {
  await openRule(page, "preview-booking-workspace--error", "create")
  await expect(page.getByTestId(FeedbackTestId.Root)).toHaveAttribute("role", "alert")
  await expect(page.getByTestId(FeedbackTestId.Root)).toContainText(t("booking.feedback.loadError.title"))
  await page.getByTestId(DialogTestId.Close).click()
  await expect(page.getByTestId(SchedulerTestId.Retry)).toHaveAccessibleName(t("common.retry"))
  await page.getByTestId(SchedulerTestId.Retry).focus()
  await expect(page.getByTestId(SchedulerTestId.Retry)).toBeFocused()
  await page.getByTestId(SchedulerTestId.Retry).press("Enter")
  await expect(page.getByTestId(FeedbackTestId.Root)).toContainText(t("booking.feedback.loadError.title"))
  await assertFormAccessibility(page)
})

test("submitting announces progress and disables repeated submissions", async ({ page }) => {
  await openRule(page, "booking-recovery-rules--submitting")
  await expect(page.getByTestId(EditorTestId.Submit)).toBeDisabled()
  await expect(page.getByTestId(EditorTestId.Submit)).toHaveAccessibleName(t("booking.form.sending"))
  await expectNoHorizontalOverflow(page)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4, { timeout: 10000 })
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await assertFormAccessibility(page)
})
