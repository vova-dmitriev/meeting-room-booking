import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { Theme } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { DialogTestId } from "@/shared/ui/dialog"
import { ToastTestId } from "@/shared/ui/toast/test-ids"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { BookingIntervals, BookingTitles } from "../booking.fixtures"
import { holdSavedSchedule, SaveToastLayout } from "./save-toast.fixtures"

const t = createI18n().t

for (const theme of [Theme.Light, Theme.Dark]) {
  for (const editing of [false, true]) {
    test(`${theme} confirmed ${editing ? "update" : "create"} shows a top-right toast without resizing the pending editor`, async ({
      page,
    }) => {
      await page.goto(`/iframe.html?id=preview-booking-workspace--default&viewMode=story&globals=theme:${theme}`)
      await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
      const api = await holdSavedSchedule(page)

      if (editing) await page.getByTestId(BookingTestId.Card).first().getByTestId(BookingTestId.Edit).click()
      else await page.getByTestId(SchedulerTestId.Create).click()
      await page.getByTestId(EditorTestId.Title).fill(BookingTitles.Release)
      await page.getByTestId(EditorTestId.Start).fill(BookingIntervals.Recovery.start)
      await page.getByTestId(EditorTestId.End).fill(BookingIntervals.Recovery.end)
      const dialog = page.getByTestId(DialogTestId.Root)
      const before = await dialog.boundingBox()

      try {
        await page.getByTestId(EditorTestId.Submit).click()
        await expect.poll(() => api.refreshes).toBeGreaterThan(0)
        const toast = page.getByTestId(ToastTestId.Message)

        await expect(toast).toBeVisible()
        const message = t(editing ? "booking.feedback.success.updatedTitle" : "booking.feedback.success.title")

        await expect(toast).toContainText(message)
        await expect(page.getByTestId(EditorTestId.Form)).not.toContainText(message)
        const after = await dialog.boundingBox()

        expect(after?.height).toBeCloseTo(before!.height, 0)
        expect(after?.y).toBeCloseTo(before!.y, 0)

        await expect
          .poll(async () => {
            const box = await toast.boundingBox()

            return box ? page.viewportSize()!.width - box.x - box.width : Infinity
          })
          .toBeLessThanOrEqual(SaveToastLayout.MaxEdgeInset)

        await expect.poll(async () => (await toast.boundingBox())?.y ?? Infinity).toBeLessThanOrEqual(SaveToastLayout.MaxTopInset)
        await page.getByTestId(ToastTestId.Close).click()
        await expect(toast).toHaveCount(0)
        await expect(dialog).toBeVisible()
      } finally {
        api.release()
      }

      await expect(dialog).toHaveCount(0)
      await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(editing ? 3 : 4)
    })
  }
}
