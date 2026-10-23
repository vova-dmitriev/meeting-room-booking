import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { byIdentity, fillBooking, openWorkspace } from "./workspace"

test("retains a rejected draft, refreshes the concurrent booking and recovers in a free slot", async ({ page }) => {
  await openWorkspace(page, "conflict")
  await fillBooking(page, "Планирование после конфликта")
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(EditorTestId.Feedback)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue("Планирование после конфликта")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue("10:00")
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue("11:00")

  const concurrent = await byIdentity(page.getByTestId(BookingTestId.Card), "data-booking-id", "concurrent")

  await expect(concurrent).toContainText("10:00")
  await expect(concurrent).toContainText("11:00")
  await fillBooking(page, "Планирование после конфликта", "12:00", "13:00")
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(5)
  await expect(page.getByTestId(BookingTestId.Card).nth(3)).toContainText("Планирование после конфликта")
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
})
