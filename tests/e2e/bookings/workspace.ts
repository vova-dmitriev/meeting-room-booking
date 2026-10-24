import { expect, type Locator, type Page } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { PageTestId } from "@/_pages/bookings"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { BookingIntervals } from "../booking.fixtures"

export async function openWorkspace(page: Page, story = "default") {
  await page.goto(`/iframe.html?id=preview-booking-workspace--${story}&viewMode=story`)
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
}

export async function byIdentity(rows: Locator, attribute: string, identity: string) {
  const identities = await rows.evaluateAll((elements, name) => elements.map((element) => element.getAttribute(name)), attribute)
  const index = identities.indexOf(identity)

  expect(index, `Expected ${attribute}=${identity}`).toBeGreaterThanOrEqual(0)

  return rows.nth(index)
}

export async function fillBooking(
  page: Page,
  title: string,
  start: string = BookingIntervals.Default.start,
  end: string = BookingIntervals.Default.end,
) {
  if (!(await page.getByTestId(EditorTestId.Form).isVisible())) {
    await page.getByTestId(SchedulerTestId.Create).click()
  }

  await expect(page.getByTestId(EditorTestId.Form)).toBeVisible()
  await page.getByTestId(EditorTestId.Title).fill(title)
  await page.getByTestId(EditorTestId.Start).fill(start)
  await page.getByTestId(EditorTestId.End).fill(end)
}

export async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.getByTestId(PageTestId.Root).evaluate((root) => ({
    content: root.ownerDocument.documentElement.scrollWidth,
    viewport: root.ownerDocument.defaultView?.innerWidth ?? 0,
  }))

  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport)
}
