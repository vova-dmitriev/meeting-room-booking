import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { delay, http, HttpResponse } from "msw"
import { PreviewState } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "../bookings-page"
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
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "11:00"),
}

export const ServerError: Story = {
  name: t("booking.feedback.loadError.networkError"),
  parameters: {
    mockHandlers: [
      http.post("http://api.storybook.local/bookings", async () => {
        await delay(350)

        return HttpResponse.json({ code: "UNAVAILABLE" }, { status: 503 })
      }),
    ],
  },
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "11:00"),
}

export const Submitting: Story = {
  name: t("booking.form.sending"),
  parameters: { scenario: PreviewState.Sending },
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "11:00"),
}
