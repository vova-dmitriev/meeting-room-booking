import { expect, test } from "@playwright/test"
import { DayFeedTestId } from "@/entities/booking"
import { Theme } from "@/shared/config"

for (const theme of [Theme.Light, Theme.Dark]) {
  test(`${theme} free interval hover preserves readable text and the transparent time gutter`, async ({ page }) => {
    await page.goto(`/iframe.html?id=booking-day-feed--populated&viewMode=story&globals=theme:${theme}`)
    const row = page.getByTestId(DayFeedTestId.Free).nth(1)

    await expect(row).toBeVisible()
    await page.mouse.move(0, page.viewportSize()!.height - 1)

    const before = await row.evaluate((element) => {
      const style = getComputedStyle(element)

      return { color: style.color, background: style.backgroundColor }
    })

    await row.hover()

    await row.evaluate(async (element) => {
      await Promise.allSettled(element.getAnimations({ subtree: true }).map((animation) => animation.finished))
    })

    await expect(row).toHaveCSS("color", before.color)
    await expect(row).toHaveCSS("background-color", before.background)
    await row.focus()
    await expect(row).toBeFocused()
    await expect(row).toHaveCSS("color", before.color)
    await expect(row).toHaveCSS("background-color", before.background)
  })
}
