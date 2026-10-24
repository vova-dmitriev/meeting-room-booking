import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog/test-ids"
import { createI18n } from "@/shared/lib/i18n"
import { BookingDates, WorkdayIntervalLabel } from "../booking.fixtures"

const t = createI18n().t

test.beforeEach(async ({ page }) => {
  await page.goto("/iframe.html?id=preview-booking-workspace--default&viewMode=story")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("editing opens immediately in a modal without a permanently visible form", async ({ page }) => {
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await page.getByTestId(BookingTestId.Card).first().getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Form)).toBeInViewport({ ratio: 0.6 })
  await expect(page.getByTestId(DialogTestId.Close)).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
})

test("an empty future date shows the entire free workday interval", async ({ page }) => {
  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Tomorrow)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await expect(page.getByTestId(SchedulerTestId.Root)).toContainText(WorkdayIntervalLabel)
  await expect(page.getByTestId(SchedulerTestId.Root)).toContainText(t("dayFeed.fullDay"))
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
})

test("past dates are viewable with ended-day copy and creation disabled", async ({ page }) => {
  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Past)
  await expect(page.getByTestId(SchedulerTestId.Root)).toContainText(t("dayFeed.ended"))
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeDisabled()
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Tomorrow)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
})
