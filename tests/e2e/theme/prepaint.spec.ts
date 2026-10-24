import { expect, test } from "@playwright/test"
import { BootstrapTestId } from "@/_app/composition/bootstrap-status/test-ids"
import { DocumentTestId } from "@/shared/config/test-ids"
import { ThemeTestId } from "@/shared/lib/theme"
import { PageTestId } from "@/_pages/bookings"
import { captureThemeFrames, readThemeFrames } from "./workspace"
import { ThemeFixture as fixture, ThemePrepaintScenarios } from "./fixtures"

test.use({ baseURL: fixture.Origin })

for (const scenario of ThemePrepaintScenarios) {
  test(`${scenario.source} ${scenario.theme} paints correctly before hydration`, async ({ page }) => {
    const errors: Error[] = []

    let release = () => {}

    const hold = new Promise<void>((resolve) => {
      release = resolve
    })

    page.on("pageerror", (error) => errors.push(error))
    await page.emulateMedia({ colorScheme: scenario.system })

    await page.addInitScript(
      ({ key, theme }) => {
        if (theme) localStorage.setItem(key, theme)
      },
      { key: fixture.StorageKey, theme: scenario.saved },
    )

    await page.route("**/_next/static/**", async (route) => {
      if (new URL(route.request().url()).pathname.endsWith(".js")) await hold

      await route.continue()
    })

    await page.goto("/", { waitUntil: "commit" })

    try {
      await expect(page.getByTestId(BootstrapTestId.Status)).toBeVisible()
      await captureThemeFrames(page)
      await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
      await expect(page.getByTestId(DocumentTestId.Root)).toHaveCSS("color-scheme", scenario.theme)
      await expect(page.getByTestId(ThemeTestId.Root)).toHaveCSS("background-color", scenario.canvas)
      await expect(page.getByTestId(BootstrapTestId.Status)).toHaveCSS("color", scenario.ink)
      const panel = await page.getByTestId(ThemeTestId.Root).evaluate((root) => getComputedStyle(root).getPropertyValue("--panel").trim())

      expect(panel).toBe(scenario.panel)
    } finally {
      release()
    }

    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await expect(page.getByTestId(ThemeTestId.Root)).toHaveCSS("background-color", scenario.canvas)
    const samples = await readThemeFrames(page)

    expect(samples.length).toBeGreaterThan(fixture.NoErrors)
    expect(samples.every((sample) => sample.theme === scenario.theme && sample.canvas === scenario.canvas)).toBe(true)
    expect(errors).toHaveLength(fixture.NoErrors)
  })
}
