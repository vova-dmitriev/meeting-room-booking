import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { PageTestId } from "@/_pages/bookings"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog"
import { byIdentity, expectNoHorizontalOverflow, fillBooking, openWorkspace } from "./workspace"
import { BookingDates, BookingIntervals, BookingTitles } from "../booking.fixtures"

test("shows the populated workspace without horizontal overflow", async ({ page }, testInfo) => {
  await openWorkspace(page)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
  await page.getByTestId(PageTestId.Root).screenshot({ path: testInfo.outputPath("workspace.png") })
})

test("creates a 10–11 meeting, edits its title and deletes it after confirmation", async ({ page }) => {
  await openWorkspace(page)
  await fillBooking(page, BookingTitles.Release)
  await page.getByTestId(EditorTestId.Submit).click()

  const cards = page.getByTestId(BookingTestId.Card)

  await expect(cards).toHaveCount(4)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)

  const created = cards.nth(1)
  const identity = await created.getAttribute("data-booking-id")

  expect(identity).toBeTruthy()
  await expect(created).toContainText(BookingTitles.Release)
  await expect(created).toContainText(BookingIntervals.Default.start)
  await expect(created).toContainText(BookingIntervals.Default.end)
  await created.getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.Release)
  await fillBooking(page, BookingTitles.UpdatedRelease)
  await page.getByTestId(EditorTestId.Submit).click()

  const edited = await byIdentity(cards, "data-booking-id", identity ?? "")

  await expect(edited).toContainText(BookingTitles.UpdatedRelease)
  await expect(cards).toHaveCount(4)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await edited.getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(DeleteTestId.Trigger).click()
  await expect(cards).toHaveCount(4)
  await page.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(3)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect.poll(() => cards.evaluateAll((rows) => rows.map((row) => row.getAttribute("data-booking-id")))).not.toContain(identity)
})

test("selects an empty day and uses it for the new booking draft", async ({ page }) => {
  await openWorkspace(page)

  for (const id of [SchedulerTestId.Previous, SchedulerTestId.Next, SchedulerTestId.DateInput]) {
    const size = await page.getByTestId(id).boundingBox()

    expect(size?.width).toBeGreaterThanOrEqual(44)
    expect(size?.height).toBeGreaterThanOrEqual(44)
  }

  await expectNoHorizontalOverflow(page)

  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Tomorrow)
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(BookingDates.Tomorrow)
  await expectNoHorizontalOverflow(page)
})
