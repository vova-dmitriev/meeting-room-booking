import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BookingCard } from "./booking-card"

const t = createI18n().t

const meta = {
  title: "Booking/Booking card",
  component: BookingCard,
  args: {
    booking: {
      id: "design",
      date: "2026-10-23",
      start: "09:30",
      end: "10:00",
      title: t("demo.meetings.designReview"),
      host: t("demo.meetings.hostOne"),
      people: 4,
    },
    onEdit: () => {},
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BookingCard>

export default meta

export const Default: StoryObj<typeof meta> = {}
