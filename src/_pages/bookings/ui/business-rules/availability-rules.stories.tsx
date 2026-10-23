import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { within } from "storybook/test"
import { BookingTestId } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "../bookings-page"
import { editOwnMeeting, selectPastDate, submitInterval } from "./story-interactions"

const t = createI18n().t

const meta = {
  id: "booking-availability-rules",
  title: "Business rules/Availability",
  component: BookingsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BookingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Overlap: Story = {
  name: t("booking.feedback.conflict.title"),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findAllByTestId(BookingTestId.Card)
    await submitInterval(canvasElement, "09:40", "10:10")
  },
}

export const TouchBefore: Story = {
  name: `${t("booking.schedule.free")}: 09:00`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "09:00", "09:30"),
}

export const TouchAfter: Story = {
  name: `${t("booking.schedule.free")}: 10:00`,
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "10:30"),
}

export const PastTime: Story = {
  name: t("booking.validation.past"),
  parameters: { now: "2026-10-23T12:30:00" },
  play: ({ canvasElement }) => submitInterval(canvasElement, "10:00", "11:00"),
}

export const PastDate: Story = {
  name: `${t("booking.form.fields.date")}: ${t("booking.validation.past")}`,
  play: ({ canvasElement }) => selectPastDate(canvasElement),
}

export const EditingSelf: Story = {
  name: t("booking.form.editTitle"),
  play: ({ canvasElement }) => editOwnMeeting(canvasElement),
}
