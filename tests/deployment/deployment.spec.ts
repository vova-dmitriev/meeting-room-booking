import { expect, test } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { createI18n } from "@/shared/lib/i18n"
import { DialogTestId } from "@/shared/ui/dialog"
import { byIdentity, expectNoHorizontalOverflow, fillBooking } from "../e2e/bookings/workspace"
import { BookingIntervals } from "../e2e/booking.fixtures"

const t = createI18n().t

test("deployed Next app boots its worker and supports CRUD", async ({ page }, testInfo) => {
  await page.goto("/")
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()

  const cards = page.getByTestId(BookingTestId.Card)

  await expect(cards).toHaveCount(3)
  await fillBooking(page, t("demo.meetings.planning"), BookingIntervals.Grid.start, BookingIntervals.Grid.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(cards).toHaveCount(4)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)

  const created = cards.nth(1)
  const identity = await created.getAttribute("data-booking-id")

  expect(identity).toBeTruthy()
  await created.getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(EditorTestId.Title).fill(t("demo.uiKit.primaryAction"))
  await page.getByTestId(EditorTestId.Submit).click()

  const edited = await byIdentity(cards, "data-booking-id", identity ?? "")

  await expect(edited).toContainText(t("demo.uiKit.primaryAction"))
  await edited.getByTestId(BookingTestId.Edit).click()
  await page.getByTestId(DeleteTestId.Trigger).click()
  await expect(cards).toHaveCount(4)
  await page.getByTestId(DeleteTestId.Confirm).click()
  await expect(cards).toHaveCount(3)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
  await page.getByTestId(PageTestId.Root).screenshot({ path: testInfo.outputPath("deployed-workspace.png") })
})

test("deployed demo resets in-memory data on a fresh page load", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  await fillBooking(page, t("demo.meetings.planning"), BookingIntervals.Grid.start, BookingIntervals.Grid.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
  await page.reload()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})

test("published Storybook boots its worker and supports booking creation", async ({ page }) => {
  const origin = process.env.STORYBOOK_DEPLOYMENT_URL

  if (!origin) throw new Error("STORYBOOK_DEPLOYMENT_URL is required")

  await page.goto(`${origin}/iframe.html?id=preview-booking-workspace--default&viewMode=story`)
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  await fillBooking(page, t("demo.meetings.planning"), BookingIntervals.Grid.start, BookingIntervals.Grid.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
  await expectNoHorizontalOverflow(page)
})
