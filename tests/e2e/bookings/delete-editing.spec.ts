import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog"
import { createI18n } from "@/shared/lib/i18n"
import { ToastTestId } from "@/shared/ui/toast"
import { openWorkspace } from "./workspace"
import { BookingIntervals, BookingTitles } from "../booking.fixtures"

const t = createI18n().t
const deleteSuccess = t("booking.delete.success")

test("deleting the edited booking resets its form and permits a new booking", async ({ page }) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)
  const edited = cards.first()
  const deletedId = await edited.getAttribute("data-booking-id")

  await edited.getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(EditorTestId.Cancel)).toBeVisible()
  await page.getByTestId(DeleteTestId.Trigger).click()
  await page.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(2)
  await expect(page.getByTestId(ToastTestId.Message).filter({ hasText: deleteSuccess })).toBeVisible()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.Empty)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Opening.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Opening.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(cards).toHaveCount(3)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect.poll(() => cards.evaluateAll((rows) => rows.map((row) => row.getAttribute("data-booking-id")))).not.toContain(deletedId)
})

test("cancelling deletion preserves the current edit and unsaved draft", async ({ page }) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)

  await cards.nth(1).getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(EditorTestId.Title).fill(BookingTitles.Unsaved)
  await page.getByTestId(DeleteTestId.Trigger).click()
  await expect(page.getByTestId(DeleteTestId.Dialog)).toBeVisible()
  await page.getByTestId(DeleteTestId.Cancel).click()
  await expect(page.getByTestId(DeleteTestId.Dialog)).toHaveCount(0)
  await expect(cards).toHaveCount(3)
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Cancel)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.Unsaved)
  await expect(page.getByTestId(ToastTestId.Message).filter({ hasText: deleteSuccess })).toHaveCount(0)
})
