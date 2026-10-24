import { expect, test } from "@playwright/test"
import { BookingTestId, DemoDate } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { FeedbackTestId } from "@/shared/ui/feedback/test-ids"
import { byIdentity, fillBooking } from "../bookings/workspace"
import { expectCreatedInterval, openRule, t } from "./workspace"
import { BookingIdentities, BookingIntervals } from "../booking.fixtures"

test("409 refreshes the list, announces conflict, retains every draft field and recovers", async ({ page }) => {
  const rejected = page.waitForResponse((response) => response.url().endsWith("/bookings") && response.request().method() === "POST")

  await openRule(page, "booking-recovery-rules--conflict")
  expect((await rejected).status()).toBe(409)
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveAttribute("role", "alert")
  await expect(page.getByTestId(EditorTestId.Feedback)).toContainText(t("booking.feedback.conflict.title"))
  await expect(page.getByTestId(EditorTestId.Feedback)).toContainText(t("booking.feedback.conflict.description"))
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(4)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(t("demo.meetings.planning"))
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Default.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Default.end)
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(DemoDate)

  const concurrent = await byIdentity(page.getByTestId(BookingTestId.Card), "data-booking-id", BookingIdentities.Concurrent)

  await expect(concurrent).toContainText(BookingIntervals.Default.start)
  await expect(concurrent).toContainText(BookingIntervals.Default.end)
  await page.getByTestId(EditorTestId.Title).fill(t("demo.uiKit.primaryAction"))
  await expect(page.getByTestId(EditorTestId.Feedback)).toContainText(t("booking.feedback.conflict.title"))
  await page.getByTestId(EditorTestId.Start).fill(BookingIntervals.Recovery.start)
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
  await fillBooking(page, t("demo.uiKit.primaryAction"), BookingIntervals.Recovery.start, BookingIntervals.Recovery.end)
  await page.getByTestId(EditorTestId.Submit).click()
  await expectCreatedInterval(page, BookingIntervals.Recovery.start, BookingIntervals.Recovery.end, 5)
  await expect(page.getByTestId(EditorTestId.Feedback)).toHaveCount(0)
})

test("503 preserves the draft through an explicit retry without creating a booking", async ({ page }) => {
  await openRule(page, "booking-recovery-rules--server-error")
  await expect(page.getByTestId(FeedbackTestId.Root)).toHaveAttribute("role", "alert")
  await expect(page.getByTestId(FeedbackTestId.Root)).toContainText(t("booking.feedback.loadError.description"))
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(t("demo.meetings.planning"))
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(BookingIntervals.Default.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(BookingIntervals.Default.end)
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)

  const retried = page.waitForResponse((response) => response.url().endsWith("/bookings") && response.request().method() === "POST")

  await page.getByTestId(EditorTestId.Submit).click()
  expect((await retried).status()).toBe(503)
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
})
