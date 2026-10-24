import type { Page } from "@playwright/test"
import { DemoDate } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"
import { BootstrapFixture } from "../../bootstrap/bootstrap.fixtures"
import { BookingIdentities, BookingIntervals, BookingTitles } from "../../booking.fixtures"

const t = createI18n().t

export const RestorationFixture = {
  Origin: process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin,
  Now: "2026-10-23T08:30:00+03:00",
  Elapsed: "2026-10-23T10:30:00+03:00",
  Linked: `/?date=${DemoDate}&booking=${BookingIdentities.Design}`,
  Unlinked: `/?date=${DemoDate}`,
  Empty: "/?date=2026-11-03",
  OtherDate: "2026-11-04",
  Draft: BookingTitles.Unsaved,
  DesignTitle: t("demo.meetings.designReview"),
  Concurrent: { date: "2026-11-03", ...BookingIntervals.Opening, title: BookingTitles.ConflictRecovery },
  Conflict: t("booking.feedback.conflict.title"),
  Missing: `/?date=${DemoDate}&booking=missing`,
} as const

export async function navigateHistory(page: Page, destination: string) {
  await page.evaluate((url) => {
    window.history.pushState(window.history.state, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, destination)
}
