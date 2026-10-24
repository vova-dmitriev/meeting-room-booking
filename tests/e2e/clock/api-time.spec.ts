import { expect, test } from "@playwright/test"
import { BookingError, type Booking } from "@/entities/booking"
import { HttpStatus } from "@/shared/api"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"
import { ClockFixture } from "./clock.fixtures"
import { openClockWorkspace, t } from "./workspace"

const applicationOrigin = process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin

test.use({ baseURL: applicationOrigin, timezoneId: ClockFixture.ClientTimezone })

test("the live mock API rejects elapsed Moscow time without writing a record", async ({ page }) => {
  await openClockWorkspace(page)

  const rejected = await page.evaluate(
    async ({ path, input }) => {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) })

      return { status: response.status, body: (await response.json()) as { code: string } }
    },
    {
      path: ClockFixture.ApiPath,
      input: { date: ClockFixture.Today, start: ClockFixture.PastStart, end: ClockFixture.PastEnd, title: t("demo.meetings.planning") },
    },
  )

  expect(rejected.status).toBe(HttpStatus.BadRequest)
  expect(rejected.body.code).toBe(BookingError.Past)

  const bookings = await page.evaluate(
    async ({ path, date }) => {
      const response = await fetch(`${path}?${new URLSearchParams({ date })}`)

      return (await response.json()) as Booking[]
    },
    { path: ClockFixture.ApiPath, date: ClockFixture.Today },
  )

  expect(bookings).toHaveLength(ClockFixture.EmptyBookings)
})
