import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { delay, http, HttpResponse } from "msw"
import { HttpStatus } from "@/shared/api"
import { BookingDraftDefaults } from "@/entities/booking"
import { RuleServerFailure } from "./scenarios"
import { PreviewState } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "@/_pages/bookings/ui/bookings-page"
import { submitInterval } from "./story-interactions"

const t = createI18n().t

const meta = {
  id: "booking-recovery-rules",
  title: "Business rules/Recovery",
  component: BookingsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BookingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Conflict: Story = {
  name: t("booking.feedback.conflict.title"),
  args: { scenario: PreviewState.Conflict },
  parameters: { scenario: PreviewState.Conflict },
  play: ({ canvasElement }) => submitInterval(canvasElement, BookingDraftDefaults.start, BookingDraftDefaults.end),
}

export const ServerError: Story = {
  name: t("booking.feedback.loadError.networkError"),
  parameters: {
    mockHandlers: [
      http.post("https://api.storybook.local/bookings", async () => {
        await delay(RuleServerFailure.Delay)

        return HttpResponse.json({ code: RuleServerFailure.Code }, { status: HttpStatus.Unavailable })
      }),
    ],
  },
  play: ({ canvasElement }) => submitInterval(canvasElement, BookingDraftDefaults.start, BookingDraftDefaults.end),
}

export const Submitting: Story = {
  name: t("booking.form.sending"),
  parameters: { scenario: PreviewState.Sending },
  play: ({ canvasElement }) => submitInterval(canvasElement, BookingDraftDefaults.start, BookingDraftDefaults.end),
}
