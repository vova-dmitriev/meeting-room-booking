import { expect, test } from "@playwright/test"
import { themeInitScript, ThemeTestId } from "@/shared/lib/theme"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DocumentTestId } from "@/shared/config/test-ids"
import { PageTestId } from "@/_pages/bookings"
import { ThemeFixture as fixture, ThemeScenarios } from "./fixtures"

test.use({ baseURL: fixture.Origin })

for (const scenario of ThemeScenarios) {
  test(`invalid stored preference falls back to ${scenario.theme} system theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.theme })

    await page.addInitScript(({ key, invalid }) => localStorage.setItem(key, invalid), {
      key: fixture.StorageKey,
      invalid: fixture.InvalidPreference,
    })

    await page.goto("/")
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.opposite)
  })

  test(`unavailable storage preserves rendering and manual ${scenario.theme} theme`, async ({ page }) => {
    const errors: Error[] = []

    page.on("pageerror", (error) => errors.push(error))
    await page.emulateMedia({ colorScheme: scenario.opposite })

    await page.addInitScript((themeKey) => {
      const getItem = Storage.prototype.getItem
      const setItem = Storage.prototype.setItem

      Storage.prototype.getItem = function (key) {
        if (key === themeKey) throw new DOMException("Storage unavailable", "SecurityError")

        return getItem.call(this, key)
      }

      Storage.prototype.setItem = function (key, value) {
        if (key === themeKey) throw new DOMException("Storage unavailable", "SecurityError")

        return setItem.call(this, key, value)
      }
    }, fixture.StorageKey)

    await page.goto("/")
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.opposite)
    await page.getByTestId(SchedulerTestId.Theme).click()
    await expect(page.getByTestId(ThemeTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await page.emulateMedia({ colorScheme: scenario.theme })
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    expect(errors).toHaveLength(fixture.NoErrors)
  })
}

for (const scenario of ThemeScenarios) {
  test(`prepaint script handles inaccessible storage with ${scenario.theme} system theme`, async ({ page }) => {
    const errors: Error[] = []

    page.on("pageerror", (error) => errors.push(error))
    await page.emulateMedia({ colorScheme: scenario.theme })

    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("Storage unavailable", "SecurityError")
        },
      })
    })

    await page.route(`**${fixture.StoragePath}`, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<html data-testid="${DocumentTestId.Root}"><head><script>${themeInitScript}</script></head><body></body></html>`,
      }),
    )

    await page.goto(fixture.StoragePath)
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveCSS("color-scheme", scenario.theme)
    expect(errors).toHaveLength(fixture.NoErrors)
  })
}
