import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { PageTestId } from "@/_pages/bookings"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { byIdentity, expectNoHorizontalOverflow, fillBooking, openWorkspace } from "./workspace"

test("shows the populated workspace without horizontal overflow", async ({ page }, testInfo) => {
  await openWorkspace(page)
  await expect(page.getByTestId(EditorTestId.Form)).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.getByTestId(PageTestId.Root).screenshot({ path: testInfo.outputPath("workspace.png") })
})

test("creates a 10–11 meeting, edits its title and deletes it after confirmation", async ({ page }) => {
  await openWorkspace(page)
  await fillBooking(page, "Планирование релиза")
  await page.getByTestId(EditorTestId.Submit).click()

  const cards = page.getByTestId(BookingTestId.Card)

  await expect(cards).toHaveCount(4)

  const created = cards.nth(1)
  const identity = await created.getAttribute("data-booking-id")

  expect(identity).toBeTruthy()
  await expect(created).toContainText("Планирование релиза")
  await expect(created).toContainText("10:00")
  await expect(created).toContainText("11:00")
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue("Планирование релиза")
  await created.getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue("Планирование релиза")
  await fillBooking(page, "Уточнённый план релиза")
  await page.getByTestId(EditorTestId.Submit).click()

  const edited = await byIdentity(cards, "data-booking-id", identity ?? "")

  await expect(edited).toContainText("Уточнённый план релиза")
  await expect(cards).toHaveCount(4)
  await edited.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(4)
  await edited.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(3)
  await expect.poll(() => cards.evaluateAll((rows) => rows.map((row) => row.getAttribute("data-booking-id")))).not.toContain(identity)
})

test("selects an empty day and resets the booking form date", async ({ page }) => {
  await openWorkspace(page)

  const days = page.getByTestId(SchedulerTestId.Day)

  await expect(days).toHaveCount(7)

  for (const candidate of await days.all()) {
    await candidate.click({ trial: true })

    const size = await candidate.boundingBox()

    expect(size?.width).toBeGreaterThanOrEqual(44)
    expect(size?.height).toBeGreaterThanOrEqual(44)
  }

  await expectNoHorizontalOverflow(page)

  const day = await byIdentity(page.getByTestId(SchedulerTestId.Day), "data-date", "2026-10-24")

  await day.click()
  await expect(day).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue("2026-10-24")
  await expectNoHorizontalOverflow(page)
})
