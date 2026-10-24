import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { ToastTestId } from "@/shared/ui/toast"
import { byIdentity, fillBooking, openWorkspace } from "./workspace"
import { BookingIdentities, BookingIntervals, BookingTitles } from "../booking.fixtures"

test("retains a rejected draft, refreshes the concurrent booking and recovers in a free slot", async ({ page }) => {
  await openWorkspace(page, "conflict")
  await fillBooking(page, BookingTitles.ConflictRecovery)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(EditorTestId.Feedback)).toBeVisible()
  await expect(page.getByTestId(ToastTestId.Message)).toHaveCount(0)
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(BookingTitles.ConflictRecovery)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Default.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Default.end)

  const concurrent = await byIdentity(page.getByTestId(BookingTestId.Card), "data-booking-id", BookingIdentities.Concurrent)

  await expect(concurrent).toContainText(BookingIntervals.Default.start)
  await expect(concurrent).toContainText(BookingIntervals.Default.end)
  await fillBooking(page, BookingTitles.ConflictRecovery, BookingIntervals.Recovery.start, BookingIntervals.Recovery.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(5)
  await expect(page.getByTestId(BookingTestId.Card).nth(3)).toContainText(BookingTitles.ConflictRecovery)
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
})
