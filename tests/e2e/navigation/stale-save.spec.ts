import { expect, test } from "@playwright/test"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { ToastTestId } from "@/shared/ui/toast"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { fillBooking } from "../bookings/workspace"
import { settleEditorCompletion } from "../bookings/editor-lifecycle.fixtures"
import { NavigationFixture as fixture } from "./fixtures"
import { holdNavigationSave } from "./save-fixtures"

test.use({ baseURL: fixture.Origin })

test("completion of a dismissed save keeps the active draft date and URL", async ({ page }) => {
  await page.clock.install({ time: new Date(fixture.Now) })
  await page.goto(fixture.Initial)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()

  const save = await holdNavigationSave(page)

  await fillBooking(page, fixture.Title, fixture.Start, fixture.End)
  await page.getByTestId(EditorTestId.Date).fill(fixture.Second)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect.poll(save.hasStarted).toBe(true)
  await page.getByTestId(DialogTestId.Close).click()
  await fillBooking(page, fixture.FreshTitle, fixture.Start, fixture.End)
  save.release()
  await expect.poll(save.hasCompleted).toBe(true)
  await expect(page.getByTestId(ToastTestId.Message)).toBeVisible()
  await settleEditorCompletion(page)
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.FreshTitle)
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(fixture.First)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.First)
  await expect(page).toHaveURL(new URL(fixture.Initial, fixture.Origin).href)
})
