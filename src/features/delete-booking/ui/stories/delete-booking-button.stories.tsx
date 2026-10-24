import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DeleteBookingButton } from "../delete-booking-button"
import { userEvent, within } from "storybook/test"
import { delay, http, HttpResponse } from "msw"
import { createI18n } from "@/shared/lib/i18n"
import { DeleteTestId } from "@/features/delete-booking/config/test-ids"
import { HttpStatus } from "@/shared/api"

const t = createI18n().t
const PendingDelay = 4000

const meta = {
  title: "Booking/Delete booking",
  component: DeleteBookingButton,
  args: { id: "design", date: "2026-10-23", start: "09:30", end: "10:00", title: t("demo.meetings.designReview") },
  tags: ["autodocs"],
} satisfies Meta<typeof DeleteBookingButton>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Confirmation: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId(DeleteTestId.Trigger))
  },
}

export const ServerError: StoryObj<typeof meta> = {
  parameters: {
    mockHandlers: [
      http.delete("https://api.storybook.local/bookings/:id", () => HttpResponse.json({}, { status: HttpStatus.Unavailable })),
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId(DeleteTestId.Trigger))
    const body = within(canvasElement.ownerDocument.body)

    await userEvent.click(body.getByTestId(DeleteTestId.Confirm))
    await body.findByTestId(DeleteTestId.Error)
  },
}

export const Pending: StoryObj<typeof meta> = {
  parameters: {
    mockHandlers: [
      http.delete("https://api.storybook.local/bookings/:id", async () => {
        await delay(PendingDelay)

        return new HttpResponse(null, { status: HttpStatus.NoContent })
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByTestId(DeleteTestId.Trigger))
    await userEvent.click(within(canvasElement.ownerDocument.body).getByTestId(DeleteTestId.Confirm))
  },
}
