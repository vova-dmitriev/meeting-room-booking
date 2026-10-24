import type { Page } from "@playwright/test"
import { BookingError } from "@/entities/booking"
import { HttpStatus } from "@/shared/api"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export const ApiValidationFixture = {
  Story: "preview-booking-workspace--empty",
  ApiPath: "/bookings",
  Start: "10:00",
  End: "11:00",
  RecoveryStart: "12:00",
  RecoveryEnd: "13:00",
  Title: t("demo.meetings.planning"),
  Past: t("booking.validation.past"),
  Invalid: "true",
  UnknownCode: "unrecognized.validation",
  RefreshFailure: t("booking.feedback.loadError.title"),
  SavedCount: 1,
  EmptyCount: 0,
} as const

export async function rejectNextWrite(page: Page, code: string = BookingError.Past) {
  await page.evaluate(
    ({ path, code, status }) => {
      const originalFetch = window.fetch.bind(window)
      let rejected = false

      window.fetch = async (input, init) => {
        const request = new Request(input, init)

        if (!rejected && request.method === "POST" && new URL(request.url).pathname.endsWith(path)) {
          rejected = true

          return Response.json({ code }, { status })
        }

        return originalFetch(input, init)
      }
    },
    { path: ApiValidationFixture.ApiPath, code, status: HttpStatus.BadRequest },
  )
}
