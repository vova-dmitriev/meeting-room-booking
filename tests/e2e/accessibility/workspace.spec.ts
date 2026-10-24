import axe from "axe-core"
import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { Theme } from "@/shared/config"
import { ThemeTestId } from "@/shared/lib/theme/test-ids"
import { openWorkspace } from "../bookings/workspace"

for (const theme of [Theme.Light, Theme.Dark]) {
  test(`loaded workspace has accessible headings and distinct landmarks in ${theme}`, async ({ page }) => {
    await openWorkspace(page)

    if (theme === Theme.Dark) await page.getByTestId(SchedulerTestId.Theme).click()

    await expect(page.getByTestId(ThemeTestId.Root)).toHaveAttribute("data-theme", theme)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)

    await page.getByTestId(ThemeTestId.Root).evaluate(async (root) => {
      await Promise.allSettled(root.getAnimations({ subtree: true }).map((animation) => animation.finished))
    })

    await page.addScriptTag({ content: axe.source })

    const violations = await page.evaluate(async () => {
      const result = await axe.run(document)

      return result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))
    })

    expect(violations).toEqual([])
  })
}
