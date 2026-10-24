import { expect, test } from "@playwright/test"
import { ThemeTestId } from "@/shared/lib/theme"
import { ThemeFixture as fixture, ThemeScenarios } from "./fixtures"

for (const scenario of ThemeScenarios) {
  test(`explicit ${scenario.theme} stories isolate saved preferences and toggles`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await page.addInitScript(({ key, theme }) => localStorage.setItem(key, theme), { key: fixture.StorageKey, theme: scenario.opposite })
    await page.goto(scenario.theme === fixture.Dark.theme ? fixture.DarkStory : fixture.LightStory)
    await expect(page.getByTestId(ThemeTestId.Toggle)).toHaveAttribute("data-theme", scenario.theme)
    await page.getByTestId(ThemeTestId.Toggle).click()
    await expect(page.getByTestId(ThemeTestId.Toggle)).toHaveAttribute("data-theme", scenario.opposite)
    const saved = await page.evaluate((key) => localStorage.getItem(key), fixture.StorageKey)

    expect(saved).toBe(scenario.opposite)
    await page.goto(fixture.SystemStory)
    await expect(page.getByTestId(ThemeTestId.Toggle)).toHaveAttribute("data-theme", scenario.opposite)
    await page.emulateMedia({ colorScheme: scenario.theme })
    await expect(page.getByTestId(ThemeTestId.Toggle)).toHaveAttribute("data-theme", scenario.theme)
  })
}
