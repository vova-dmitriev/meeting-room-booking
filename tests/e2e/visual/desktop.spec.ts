import { expect, test } from "@playwright/test"
import { EditorTestId } from "@/features/booking-editor"
import { PageTestId } from "@/_pages/bookings"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog"
import { Theme } from "@/shared/config"
import { openVisualWorkspace } from "./workspace"

test("desktop workspace in the light theme matches the baseline", async ({ page }) => {
  await openVisualWorkspace(page, Theme.Light)
  await expect(page.getByTestId(PageTestId.Root)).toHaveScreenshot("workspace-desktop.png")
})

test("desktop workspace in the dark theme matches the baseline", async ({ page }) => {
  await openVisualWorkspace(page, Theme.Dark)
  await expect(page.getByTestId(PageTestId.Root)).toHaveScreenshot("workspace-desktop-dark.png")
})

test("desktop editor dialog matches the baseline", async ({ page }) => {
  await openVisualWorkspace(page)
  await page.getByTestId(SchedulerTestId.Create).click()
  await expect(page.getByTestId(EditorTestId.Form)).toBeVisible()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveScreenshot("editor-dialog.png")
})
