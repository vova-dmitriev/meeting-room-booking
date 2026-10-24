import { expect, test } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { openVisualWorkspace } from "./workspace"

test("mobile workspace matches the baseline", async ({ page }) => {
  await openVisualWorkspace(page)
  await expect(page.getByTestId(PageTestId.Root)).toHaveScreenshot("workspace-mobile.png")
})
