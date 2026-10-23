import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PreviewState } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "../bookings-page"
import { submitInterval } from "./story-interactions"

const t = createI18n().t

const meta = {
  id: "booking-time-rules",
  title: "Business rules/Time",
  component: BookingsPage,
  args: { scenario: PreviewState.Empty },
  parameters: { layout: "fullscreen", scenario: PreviewState.Empty },
} satisfies Meta<typeof BookingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const StartBeforeWorkday: Story = {
  name: `${t("booking.form.fields.start")}: ${t("booking.validation.workday")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "08:59", "09:30"),
}

export const StartAfterWorkday: Story = {
  name: `${t("booking.form.fields.start")}: ${t("booking.feedback.loadError.title")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "18:01", "18:31"),
}

export const EndBeforeWorkday: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.feedback.loadError.title")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "08:00", "08:30"),
}

export const EndAfterWorkday: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.validation.workday")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "17:30", "18:01"),
}

export const EqualTimes: Story = {
  name: `${t("booking.form.fields.start")}: ${t("booking.validation.order")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "10:00"),
}

export const ReversedTimes: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.validation.order")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "11:00", "10:00"),
}

export const BelowMinimum: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: 29 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "10:29"),
}

export const AboveMaximum: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: 121 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "12:01"),
}

export const MinimumDuration: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: 30 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "09:00", "09:30"),
}

export const MaximumDuration: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: 120 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "16:00", "18:00"),
}

export const OffStep: Story = {
  name: t("booking.validation.step"),
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:05", "10:35"),
}
