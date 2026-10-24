import { expect, test } from "@playwright/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { HttpStatus } from "@/shared/api"
import { fillBooking } from "../../bookings/workspace"
import { navigateHistory, RestorationFixture as fixture } from "./fixtures"

test.use({ baseURL: fixture.Origin })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(fixture.Now) })
})

test("conflict refresh preserves the manually opened draft", async ({ page }) => {
  await page.goto(fixture.Empty)
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()
  await fillBooking(page, fixture.Draft, fixture.Concurrent.start, fixture.Concurrent.end)

  const status = await page.evaluate(async (input) => {
    const response = await fetch("/api/bookings", { method: "POST", body: JSON.stringify(input) })

    return response.status
  }, fixture.Concurrent)

  expect(status).toBe(HttpStatus.Created)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(EditorTestId.Feedback)).toContainText(fixture.Conflict)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.Draft)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(fixture.Concurrent.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(fixture.Concurrent.end)
  await expect(page).toHaveURL(new URL(fixture.Empty, fixture.Origin).href)
})

test("repeated back and forward restore the same linked booking", async ({ page }) => {
  await page.goto(fixture.Linked)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.DesignTitle)
  await navigateHistory(page, fixture.Unlinked)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)

  for (const _ of [0, 1]) {
    await page.goBack()
    await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.DesignTitle)
    await page.goForward()
    await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  }
})

test("unknown linked identities close the previous linked editor", async ({ page }) => {
  await page.goto(fixture.Linked)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.DesignTitle)
  await navigateHistory(page, fixture.Missing)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
})

test("linked bookings wait for their selected date data", async ({ page }) => {
  await page.goto(fixture.Empty)
  await expect(page.getByTestId(SchedulerTestId.Empty)).toBeVisible()

  const booking = await page.evaluate(
    async (input) => {
      const response = await fetch("/api/bookings", { method: "POST", body: JSON.stringify(input) })

      return (await response.json()) as { id: string; date: string }
    },
    { ...fixture.Concurrent, date: fixture.OtherDate },
  )

  await navigateHistory(page, `/?date=${booking.date}&booking=${booking.id}`)
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.Concurrent.title)
  await expect(page.getByTestId(EditorTestId.Date)).toHaveValue(fixture.OtherDate)
})

test("elapsed linked bookings preserve the read-only schedule", async ({ page }) => {
  await page.clock.setSystemTime(new Date(fixture.Elapsed))
  await page.goto(fixture.Linked)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
})
