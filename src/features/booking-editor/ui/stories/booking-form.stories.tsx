import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PreviewState } from "@/shared/config"
import { BookingForm } from "../booking-form"

const t = createI18n().t

const meta = {
  title: "Booking/Booking form",
  component: BookingForm,
  args: { date: "2026-10-23", bookings: [], onCancel: () => {} },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { scenario: PreviewState.Invalid } }

export const Submitting: Story = { args: { scenario: PreviewState.Sending } }

export const Editing: Story = {
  args: { editing: { id: "one", date: "2026-10-23", start: "10:00", end: "11:00", title: t("demo.meetings.planning") } },
}
