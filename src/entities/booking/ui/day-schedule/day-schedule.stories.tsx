import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DaySchedule } from "./day-schedule"

const t = createI18n().t

const meta = {
  title: "Booking/Day schedule",
  component: DaySchedule,
  args: { bookings: [{ id: "one", date: "2026-10-23", start: "11:00", end: "12:00", title: t("demo.meetings.planning") }] },
  tags: ["autodocs"],
} satisfies Meta<typeof DaySchedule>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Empty: StoryObj<typeof meta> = { args: { bookings: [] } }
