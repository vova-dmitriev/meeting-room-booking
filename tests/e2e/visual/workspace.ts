import { expect, type Page } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { PageTestId } from "@/_pages/bookings"
import { Theme } from "@/shared/config"

const populatedBookingCount = 3

export async function openVisualWorkspace(page: Page, theme: Theme = Theme.Light) {
  await page.goto(`/iframe.html?id=preview-booking-workspace--default&viewMode=story&globals=theme:${theme}`)
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(populatedBookingCount)

  await page.evaluate(async () => {
    await document.fonts.ready
  })
}
