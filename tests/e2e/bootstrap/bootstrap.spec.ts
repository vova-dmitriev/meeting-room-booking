import { expect, test } from "@playwright/test"
import { BootstrapTestId } from "@/_app/composition/bootstrap-status/test-ids"
import { BookingTestId, DemoNow } from "@/entities/booking"
import { ScheduleSkeletonTestId } from "@/widgets/booking-scheduler"
import { SkeletonTestId } from "@/shared/ui/skeleton/test-ids"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { PageTestId } from "@/_pages/bookings"
import { createI18n } from "@/shared/lib/i18n"
import { holdBootstrapAndData, readBootstrapRequests } from "./loading-control"
import { BootstrapFixture } from "./bootstrap.fixtures"

const t = createI18n().t
const applicationOrigin = process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin

test.use({ baseURL: applicationOrigin })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(DemoNow) })
})

test.describe("blocked service workers", () => {
  test.use({ serviceWorkers: "block" })

  test("shows an explicit error and keeps retry available after another rejection", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId(BootstrapTestId.Error)).toBeVisible()
    await expect(page.getByTestId(BootstrapTestId.Error)).toHaveAttribute("role", "alert")
    await expect(page.getByTestId(BootstrapTestId.Error)).toContainText(t("bootstrap.errorTitle"))
    await expect(page.getByTestId(BootstrapTestId.Retry)).toHaveAccessibleName(t("bootstrap.retry"))
    await expect(page.getByTestId(BootstrapTestId.Retry)).toBeEnabled()
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
    await page.getByTestId(BootstrapTestId.Retry).click()
    await expect(page.getByTestId(BootstrapTestId.Error)).toBeVisible()
    await expect(page.getByTestId(BootstrapTestId.Retry)).toBeEnabled()
  })
})

test("recovers the actual workspace after a transient registration rejection", async ({ page }) => {
  await page.addInitScript(
    ({ message, resume }) => {
      const register = navigator.serviceWorker.register.bind(navigator.serviceWorker)
      const registrationReleased = new Promise<void>((resolve) => window.addEventListener(resume, () => resolve(), { once: true }))
      let rejectNextRegistration = true

      navigator.serviceWorker.register = async (...args) => {
        if (rejectNextRegistration) {
          rejectNextRegistration = false

          return Promise.reject(new Error(message))
        }

        await registrationReleased

        return register(...args)
      }
    },
    { message: BootstrapFixture.RegistrationError, resume: BootstrapFixture.ResumeRegistration },
  )

  await page.goto("/")
  await expect(page.getByTestId(BootstrapTestId.Error)).toBeVisible()
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(0)
  await page.getByTestId(BootstrapTestId.Retry).click()
  await expect(page.getByTestId(BootstrapTestId.Loading)).toHaveAttribute("role", "status")
  await expect(page.getByTestId(BootstrapTestId.Loading)).toHaveAccessibleName(t("booking.feedback.loading"))
  await expect(page.getByTestId(ScheduleSkeletonTestId.List).getByTestId(SkeletonTestId.Root)).toHaveCount(BootstrapFixture.ListSkeletons)
  await expect(page.getByTestId(SchedulerTestId.RoomHeading)).toBeVisible()
  await expect(page.getByTestId(PageTestId.Root)).toHaveCount(BootstrapFixture.EmptyCount)
  await expect(page.getByTestId(BootstrapTestId.Retry)).toHaveCount(0)
  await page.evaluate((resume) => window.dispatchEvent(new Event(resume)), BootstrapFixture.ResumeRegistration)
  await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(BootstrapFixture.InitialBookings)
  await expect(page.getByTestId(BootstrapTestId.Status)).toHaveCount(0)
})

for (const font of BootstrapFixture.SkeletonFonts) {
  test(`keeps the schedule skeleton through booking data loading with ${font.name}`, async ({ page }) => {
    await holdBootstrapAndData(page)
    await page.goto("/")
    if (font.style) await page.addStyleTag({ content: font.style })
    await expect(page.getByTestId(ScheduleSkeletonTestId.List).getByTestId(SkeletonTestId.Root)).toHaveCount(BootstrapFixture.ListSkeletons)
    await expect(page.getByTestId(BootstrapTestId.Loading)).toHaveAccessibleName(t("booking.feedback.loading"))
    await expect(page.getByTestId(PageTestId.Root)).toHaveCount(BootstrapFixture.EmptyCount)
    await expect(page.getByTestId(BootstrapTestId.Loading)).toHaveText(BootstrapFixture.RoomCopy, { useInnerText: true })
    expect(await readBootstrapRequests(page)).toBe(BootstrapFixture.EmptyCount)

    const initialRows = await page
      .getByTestId(ScheduleSkeletonTestId.List)
      .getByTestId(SkeletonTestId.Root)
      .evaluateAll((rows) =>
        rows.map((row) => ({
          x: row.getBoundingClientRect().x,
          y: row.getBoundingClientRect().y,
          width: row.getBoundingClientRect().width,
          height: row.getBoundingClientRect().height,
        })),
      )

    await page.evaluate((resume) => window.dispatchEvent(new Event(resume)), BootstrapFixture.ResumeRegistration)
    await expect(page.getByTestId(PageTestId.Root)).toBeVisible()
    await expect(page.getByTestId(ScheduleSkeletonTestId.List).getByTestId(SkeletonTestId.Root)).toHaveCount(BootstrapFixture.ListSkeletons)

    const dataRows = await page
      .getByTestId(ScheduleSkeletonTestId.List)
      .getByTestId(SkeletonTestId.Root)
      .evaluateAll((rows) =>
        rows.map((row) => ({
          x: row.getBoundingClientRect().x,
          y: row.getBoundingClientRect().y,
          width: row.getBoundingClientRect().width,
          height: row.getBoundingClientRect().height,
        })),
      )

    expect(dataRows).toEqual(initialRows)
    await page.evaluate((resume) => window.dispatchEvent(new Event(resume)), BootstrapFixture.ResumeData)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(BootstrapFixture.InitialBookings)
    await expect(page.getByTestId(ScheduleSkeletonTestId.List)).toHaveCount(BootstrapFixture.EmptyCount)
  })
}
