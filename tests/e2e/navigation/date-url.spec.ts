import { expect, test } from "@playwright/test"
import { EditorTestId } from "@/features/booking-editor"
import { DialogTestId } from "@/shared/ui/dialog"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { fillBooking } from "../bookings/workspace"
import { NavigationFixture as fixture } from "./fixtures"

test.use({ baseURL: fixture.Origin, timezoneId: "America/Los_Angeles" })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(fixture.Now) })
})

test("restores a linked date and persists selection without reloading", async ({ page }) => {
  await page.goto(fixture.Initial)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.First)

  const documentHandle = await page.evaluateHandle(() => document)

  await page.evaluate((marker) => {
    window.history.replaceState({ ...window.history.state, navigationProbe: marker }, "")
  }, fixture.HistoryMarker)

  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Second)
  await expect(page).toHaveURL(new URL(fixture.Selected, fixture.Origin).href)
  expect(await documentHandle.evaluate((original) => original === document)).toBe(true)
  expect(await page.evaluate(() => window.history.state.navigationProbe)).toBe(fixture.HistoryMarker)
  await page.reload()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
  await page.getByTestId(SchedulerTestId.Next).click()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Third)
  await page.goBack()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
  await page.goBack()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.First)
  await page.goForward()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
})

test("back to a URL without a date restores the current Moscow day", async ({ page }) => {
  await page.goto(fixture.Missing)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Today)
  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Second)
  await page.clock.setSystemTime(new Date(fixture.AfterMidnight))
  await page.goBack()
  await expect(page).toHaveURL(new URL(fixture.Missing, fixture.Origin).href)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.NextToday)
  await page.goForward()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
})

test("a popstate on the same date does not suppress the next selected date", async ({ page }) => {
  await page.goto(fixture.Initial)
  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Second)
  await expect(page).toHaveURL(new URL(fixture.Selected, fixture.Origin).href)

  await page.evaluate((href) => {
    window.history.pushState(window.history.state, "", href)
  }, fixture.SameDayNavigation)

  await page.goBack()
  await expect(page).toHaveURL(new URL(fixture.Selected, fixture.Origin).href)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Third)
  await expect(page).toHaveURL(new URL(fixture.ThirdSelected, fixture.Origin).href)
})

test("invalid calendar dates fall back before any booking request", async ({ page }) => {
  const requestedDates: string[] = []

  page.on("request", (request) => {
    const url = new URL(request.url())

    if (url.pathname === "/api/bookings") requestedDates.push(url.searchParams.get("date") ?? "")
  })

  await page.goto(fixture.Invalid)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Today)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Second)
  await page.goBack()
  await expect(page).toHaveURL(new URL(fixture.Invalid, fixture.Origin).href)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Today)
  expect(requestedDates).not.toContain(fixture.InvalidDate)
})

test("saving on another date updates the selected day and its URL", async ({ page }) => {
  await page.goto(fixture.Initial)
  await expect(page.getByTestId(SchedulerTestId.Create)).toBeEnabled()
  await fillBooking(page, fixture.Title, fixture.Start, fixture.End)
  await page.getByTestId(EditorTestId.Date).fill(fixture.Second)
  await page.getByTestId(EditorTestId.Submit).click()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
  await expect(page).toHaveURL(new URL(fixture.Selected, fixture.Origin).href)
  await page.reload()
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
})
