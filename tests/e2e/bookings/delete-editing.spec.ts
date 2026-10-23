import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { openWorkspace } from "./workspace"

test("deleting the edited booking resets its form and permits a new booking", async ({ page }) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)
  const edited = cards.first()
  const deletedId = await edited.getAttribute("data-booking-id")

  await edited.getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(EditorTestId.Cancel)).toBeVisible()
  await edited.getByTestId(DeleteTestId.Confirm).click()
  await edited.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(2)
  await expect(page.getByTestId(EditorTestId.Cancel)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue("")
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue("10:00")
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue("11:00")
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(cards).toHaveCount(3)
  await expect.poll(() => cards.evaluateAll((rows) => rows.map((row) => row.getAttribute("data-booking-id")))).not.toContain(deletedId)
})

test("deleting another booking preserves the current edit and unsaved draft", async ({ page }) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)

  await cards.nth(1).getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(EditorTestId.Title).fill("Несохранённые изменения")
  await cards.first().getByTestId(DeleteTestId.Confirm).click()
  await cards.first().getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(2)
  await expect(page.getByTestId(EditorTestId.Cancel)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue("Несохранённые изменения")
})
