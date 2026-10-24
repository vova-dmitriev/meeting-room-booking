import { expect, test, type Page } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DateRecoveryDraft, DateRecoveryReply, DateRecoveryValue, installDateRecoveryApi } from "./date-recovery.fixtures"

async function openRejectedDraft(page: Page) {
  await page.goto(DateRecoveryValue.Story)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)

  const api = await installDateRecoveryApi(page)

  await page.getByTestId(SchedulerTestId.Create).click()
  await page.getByTestId(EditorTestId.Title).fill(DateRecoveryValue.Title)
  await page.getByTestId(EditorTestId.Start).fill(DateRecoveryValue.Start)
  await page.getByTestId(EditorTestId.End).fill(DateRecoveryValue.End)
  await page.getByTestId(EditorTestId.Date).fill(DateRecoveryValue.Date)
  await expect.poll(() => api.readAttempts).toBe(1)
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()

  return api
}

async function expectDraftPreserved(page: Page) {
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(DateRecoveryValue.Date)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(DateRecoveryValue.Title)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(DateRecoveryValue.Start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(DateRecoveryValue.End)
}

test("retrying the target date validates fresh server conflicts before posting", async ({ page }) => {
  const api = await openRejectedDraft(page)

  api.respondWith(DateRecoveryReply.Concurrent)
  const retry = api.holdNextRead()

  await page.getByTestId(EditorTestId.Submit).click()
  await expect.poll(() => api.readAttempts).toBe(2)

  for (const id of [EditorTestId.Date, EditorTestId.Title, EditorTestId.Start, EditorTestId.End, EditorTestId.Submit]) {
    await expect(page.getByTestId(id)).toBeDisabled()
  }

  retry.release()
  await expect(page.getByTestId(EditorTestId.Form)).toContainText(DateRecoveryValue.Overlap)
  await expectDraftPreserved(page)
  expect(api.writes).toHaveLength(0)
  await page.getByTestId(EditorTestId.Start).fill(DateRecoveryValue.FreeStart)
  await page.getByTestId(EditorTestId.End).fill(DateRecoveryValue.FreeEnd)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  expect(api.writes).toEqual([DateRecoveryDraft.Free])
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(2)
  await expect(page.getByTestId(BookingTestId.Card).last()).toContainText(DateRecoveryValue.Title)
})

test("a failed target-date retry keeps the draft and later service recovery saves it", async ({ page }) => {
  const api = await openRejectedDraft(page)

  await page.getByTestId(EditorTestId.Submit).click()
  await expect.poll(() => api.readAttempts).toBe(2)
  await expect(page.getByTestId(EditorTestId.Form)).toContainText(DateRecoveryValue.LoadError)
  await expectDraftPreserved(page)
  expect(api.writes).toHaveLength(0)
  api.respondWith(DateRecoveryReply.Empty)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  expect(api.readAttempts).toBeGreaterThanOrEqual(3)
  expect(api.writes).toEqual([DateRecoveryDraft.Rejected])
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(1)
  await expect(page.getByTestId(BookingTestId.Card)).toContainText(DateRecoveryValue.Title)
})
