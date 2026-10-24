import { expect, test, type Page } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { ToastTestId } from "@/shared/ui/toast"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { EditorLifecycleCases, EditorLifecycleValue, installEditorLifecycleApi, settleEditorCompletion } from "./editor-lifecycle.fixtures"

async function openWorkspace(page: Page) {
  await page.goto(EditorLifecycleValue.Story)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
}

async function fillDraft(page: Page, fresh = false) {
  await page.getByTestId(EditorTestId.Title).fill(fresh ? EditorLifecycleValue.NewTitle : EditorLifecycleValue.FirstTitle)
  await page.getByTestId(EditorTestId.Start).fill(fresh ? EditorLifecycleValue.NewStart : EditorLifecycleValue.Start)
  await page.getByTestId(EditorTestId.End).fill(fresh ? EditorLifecycleValue.NewEnd : EditorLifecycleValue.End)
}

test("clearing and re-entering the date keeps the editor editable and preserves the draft", async ({ page }) => {
  await openWorkspace(page)
  await page.getByTestId(SchedulerTestId.Create).click()
  await fillDraft(page)
  await page.getByTestId(EditorTestId.Date).fill(EditorLifecycleValue.Empty)
  await expect(page.getByTestId(EditorTestId.Date)).toBeEditable()
  await expect(page.getByTestId(EditorTestId.Date)).toHaveAccessibleDescription(EditorLifecycleValue.DateError)
  await expect(page.getByTestId(EditorTestId.Form)).toContainText(EditorLifecycleValue.DateError)
  await page.getByTestId(EditorTestId.Date).fill(EditorLifecycleValue.Date)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(EditorLifecycleValue.FirstTitle)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(EditorLifecycleValue.Start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(EditorLifecycleValue.End)
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()
})

for (const scenario of EditorLifecycleCases) {
  const destination = scenario.crossDate ? "across dates" : "on the selected date"

  test(`a pending ${scenario.mode} ${destination} preserves a fresh draft`, async ({ page }) => {
    await openWorkspace(page)
    const api = await installEditorLifecycleApi(page)

    const openEditor = async () => {
      if (scenario.mode === "create") await page.getByTestId(SchedulerTestId.Create).click()
      else await page.getByTestId(BookingTestId.Card).first().getByTestId(BookingTestId.Edit).click()
    }

    await openEditor()
    await fillDraft(page)
    if (scenario.crossDate) await page.getByTestId(EditorTestId.Date).fill(EditorLifecycleValue.TargetDate)
    await page.getByTestId(EditorTestId.Submit).click()
    await expect.poll(() => api.writes.length).toBe(1)
    await expect(page.getByTestId(EditorTestId.Submit)).toBeDisabled()
    await page.getByTestId(DialogTestId.Close).click()
    await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
    await openEditor()
    await fillDraft(page, true)
    api.release()
    await expect.poll(() => api.completedWrites).toBe(1)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(scenario.sourceCount)
    await settleEditorCompletion(page)
    await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
    await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(EditorLifecycleValue.Date)
    await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(EditorLifecycleValue.NewTitle)
    await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(EditorLifecycleValue.NewStart)
    await expect(page.getByTestId(EditorTestId.End)).toHaveValue(EditorLifecycleValue.NewEnd)
    await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(EditorLifecycleValue.Date)
    await page.getByTestId(DialogTestId.Close).click()

    if (scenario.crossDate) {
      await page.getByTestId(SchedulerTestId.DateInput).fill(EditorLifecycleValue.TargetDate)
      await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(1)
      await expect(page.getByTestId(BookingTestId.Card)).toContainText(EditorLifecycleValue.FirstTitle)
    }
  })
}

test("a confirmed save with a failed refresh retries reading without posting the draft again", async ({ page }) => {
  await openWorkspace(page)
  const api = await installEditorLifecycleApi(page, true)

  await page.getByTestId(SchedulerTestId.Create).click()
  await fillDraft(page)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect.poll(() => api.writes.length).toBe(1)
  api.release()
  await expect.poll(() => api.failedRefreshes).toBe(1)
  await expect(page.getByTestId(EditorTestId.Form)).toContainText(EditorLifecycleValue.LoadError)
  await expect(page.getByTestId(ToastTestId.Message)).toHaveCount(1)
  await page.getByTestId(ToastTestId.Close).click()
  await expect(page.getByTestId(ToastTestId.Message)).toHaveCount(0)
  await expect(page.getByTestId(EditorTestId.Title)).toBeDisabled()
  await expect(page.getByTestId(EditorTestId.Submit)).toContainText(EditorLifecycleValue.Retry)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  expect(api.writes).toHaveLength(1)
  await expect(page.getByTestId(ToastTestId.Message)).toHaveCount(0)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
})
