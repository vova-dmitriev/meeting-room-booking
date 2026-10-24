import { expect, test } from "@playwright/test"
import { DemoDate } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog"
import { createI18n } from "@/shared/lib/i18n"
import { BookingIdentities, BookingIntervals } from "../booking.fixtures"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"

const t = createI18n().t

const fixture = {
  Origin: process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin,
  Now: "2026-10-23T08:30:00+03:00",
  DesignId: BookingIdentities.Design,
  DesignTitle: t("demo.meetings.designReview"),
  Design: BookingIntervals.Design,
  Linked: `/?date=${DemoDate}&booking=${BookingIdentities.Design}`,
  Workspace: "/",
  Unknown: `/?date=${DemoDate}&booking=missing`,
} as const

test.use({ baseURL: fixture.Origin })

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(fixture.Now) })
})

test("opens the linked booking for editing", async ({ page }) => {
  await page.goto(fixture.Linked)
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Title)).toHaveValue(fixture.DesignTitle)
  await expect(page.getByTestId(EditorTestId.Start)).toHaveValue(fixture.Design.start)
  await expect(page.getByTestId(EditorTestId.End)).toHaveValue(fixture.Design.end)
})

test("closes the editor on history navigation without the parameter", async ({ page }) => {
  await page.goto(fixture.Workspace)
  await page.goto(fixture.Linked)
  await expect(page.getByTestId(DialogTestId.Root)).toBeVisible()

  await page.goBack()
  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect(page.getByTestId(SchedulerTestId.Root)).toBeVisible()
})

test("keeps the workspace intact for an unknown booking identity", async ({ page }) => {
  await page.goto(fixture.Unknown)

  await expect(page.getByTestId(DialogTestId.Root)).toHaveCount(0)
  await expect(page.getByTestId(SchedulerTestId.Root)).toBeVisible()
})
