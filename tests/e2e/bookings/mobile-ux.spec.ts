import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { DeleteTestId } from "@/features/delete-booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { createI18n } from "@/shared/lib/i18n"
import { DialogTestId } from "@/shared/ui/dialog"
import { ConfirmationDialogTestId } from "@/shared/ui/confirmation-dialog"
import { expectNoHorizontalOverflow, fillBooking, openWorkspace } from "./workspace"
import { BookingDates, BookingIntervals, BookingTitles } from "../booking.fixtures"

const t = createI18n().t
const InitialBookingCount = 3
const BackdropClickPosition = { x: 8, y: 8 }

test("clicking outside deletion cancels only the confirmation and preserves the unsaved editor", async ({ page }) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)
  const deleteRequests: string[] = []

  page.on("request", (request) => {
    if (request.method() === "DELETE") deleteRequests.push(request.url())
  })

  await cards.first().getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(EditorTestId.Title).fill(BookingTitles.Unsaved)

  const trigger = page.getByTestId(DeleteTestId.Trigger)
  const confirmation = page.getByTestId(DeleteTestId.Dialog)

  await trigger.click()
  await expect(confirmation).toBeVisible()
  await expect(confirmation).toHaveAttribute("role", "alertdialog")
  await expect(page.getByTestId(DeleteTestId.Cancel)).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await expect(page.getByTestId(DeleteTestId.Confirm)).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(page.getByTestId(DeleteTestId.Cancel)).toBeFocused()
  await page.getByTestId(DeleteTestId.Summary).click()
  await expect(confirmation).toBeVisible()
  await page.getByTestId(ConfirmationDialogTestId.Overlay).click({ position: BackdropClickPosition })
  await expect(confirmation).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.Unsaved)
  await expect(cards).toHaveCount(InitialBookingCount)
  expect(deleteRequests).toEqual([])
})

test("a pending deletion confirmation keeps its existing dismissal lock", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-kit-confirmation-dialog--pending&viewMode=story")

  const confirmation = page.getByTestId(ConfirmationDialogTestId.Root)

  await expect(confirmation).toBeVisible()
  await expect(page.getByTestId(ConfirmationDialogTestId.Cancel)).toBeDisabled()
  await page.getByTestId(ConfirmationDialogTestId.Overlay).click({ position: BackdropClickPosition })
  await expect(confirmation).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(confirmation).toBeVisible()
})

test("deletion opens a separate dialog, supports cancel and Escape, and preserves the card layout", async ({ page }, testInfo) => {
  await openWorkspace(page)

  const cards = page.getByTestId(BookingTestId.Card)
  const card = cards.first()
  const before = await card.boundingBox()

  await card.getByTestId(BookingTestId.Edit).click()

  const trigger = page.getByTestId(DeleteTestId.Trigger)

  await trigger.click()

  const dialog = page.getByTestId(DeleteTestId.Dialog)

  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute("role", "alertdialog")
  await expect(page.getByTestId(DeleteTestId.Summary)).toContainText(t("demo.meetings.designReview"))
  await expect(page.getByTestId(DeleteTestId.Cancel)).toBeFocused()
  await expect(cards).toHaveCount(3)
  expect((await card.boundingBox())?.width).toBe(before?.width)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath("delete-dialog.png") })
  await page.getByTestId(DeleteTestId.Cancel).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(cards).toHaveCount(3)
})

test("editing opens a focused modal and create starts a fresh draft after closing it", async ({ page }) => {
  await openWorkspace(page)
  await page.getByTestId(BookingTestId.Card).first().getByTestId(BookingTestId.Edit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(DialogTestId.Close)).toBeFocused()
  await expect(page.getByTestId(EditorTestId.Form)).toBeInViewport({ ratio: 0.6 })
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(t("demo.meetings.designReview"))
  await page.keyboard.press("Escape")
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Cancel)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Form)).toBeInViewport({ ratio: 0.6 })
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.Empty)
})

test("changing the form date preserves the draft and creates a booking on that date", async ({ page }) => {
  await openWorkspace(page)
  await fillBooking(page, t("demo.meetings.planning"), BookingIntervals.Grid.start, BookingIntervals.Grid.end)
  await expect(page.getByTestId(EditorTestId.Date)).toBeEditable()
  await page.getByTestId(EditorTestId.Date).fill(BookingDates.Arbitrary)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(t("demo.meetings.planning"))
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Grid.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Grid.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(1)
  await expect(page.getByTestId(BookingTestId.Card)).toContainText(t("demo.meetings.planning"))
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(BookingDates.Arbitrary)
})

test("the schedule calendar and adjacent day controls select arbitrary dates", async ({ page }) => {
  await openWorkspace(page)
  await page.getByTestId(SchedulerTestId.DateInput).fill(BookingDates.Arbitrary)
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Form)).toHaveCount(0)
  await page.getByTestId(SchedulerTestId.Next).click()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(BookingDates.Following)
  await page.getByTestId(SchedulerTestId.Previous).click()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(BookingDates.Arbitrary)
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(BookingDates.Arbitrary)
  await expectNoHorizontalOverflow(page)
})
