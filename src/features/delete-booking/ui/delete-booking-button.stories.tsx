import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DeleteBookingButton } from "./delete-booking-button"

const meta = {
  title: "Booking/Delete booking",
  component: DeleteBookingButton,
  args: { id: "design", date: "2026-10-23" },
  tags: ["autodocs"],
} satisfies Meta<typeof DeleteBookingButton>

export default meta

export const Default: StoryObj<typeof meta> = {}
