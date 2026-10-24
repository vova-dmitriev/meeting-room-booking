import { expect, test } from "@playwright/test"
import { ThemeTestId } from "@/shared/lib/theme"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { PageTestId } from "@/_pages/bookings"
import { DocumentTestId } from "@/shared/config/test-ids"
import { ThemeFixture as fixture, ThemeScenarios } from "./fixtures"

test.use({ baseURL: fixture.Origin })

for (const scenario of ThemeScenarios) {
  test(`manual ${scenario.theme} survives reload and OS changes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await page.goto("/")
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await page.getByTestId(SchedulerTestId.Theme).click()
    await expect(page.getByTestId(ThemeTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await page.reload()
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(ThemeTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await page.emulateMedia({ colorScheme: scenario.theme })
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
  })

  test(`first visit follows ${scenario.theme} OS preference and later system changes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.theme })
    await page.goto("/")
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.theme)
    await page.emulateMedia({ colorScheme: scenario.opposite })
    await expect(page.getByTestId(DocumentTestId.Root)).toHaveAttribute("data-theme", scenario.opposite)
  })
}
