import { expect, test } from "@playwright/test"
import { ThemeFixture, ThemeScenarios } from "./fixtures"

test.use({ baseURL: ThemeFixture.Origin, javaScriptEnabled: false })

for (const scenario of ThemeScenarios) {
  test(`paints the complete ${scenario.theme} palette without JavaScript`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.theme })
    await page.goto("/")

    const palette = await page.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      ink: getComputedStyle(document.body).color,
    }))

    expect(palette).toEqual({ background: scenario.canvas, ink: scenario.ink })
  })
}
