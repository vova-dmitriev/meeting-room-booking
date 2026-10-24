import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { within } from "storybook/test"
import { BookingTestId, BookingDraftDefaults } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "@/_pages/bookings/ui/bookings-page"
import { editOwnMeeting, selectPastDate, submitInterval } from "./story-interactions"

import { RuleInterval, RuleDate } from "./scenarios"

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
    await submitInterval(canvasElement, RuleInterval.Overlap.start, RuleInterval.Overlap.end)
  },
}

export const TouchBefore: Story = {
  name: `${t("booking.schedule.free")}: ${RuleInterval.Minimum.start}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.Minimum.start, RuleInterval.Minimum.end),
}

export const TouchAfter: Story = {
  name: `${t("booking.schedule.free")}: ${RuleInterval.TouchAfter.start}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.TouchAfter.start, RuleInterval.TouchAfter.end),
}

export const PastTime: Story = {
  name: t("booking.validation.past"),
  parameters: { now: RuleDate.PastTime },
  play: ({ canvasElement }) => submitInterval(canvasElement, BookingDraftDefaults.start, BookingDraftDefaults.end),
}

export const PastDate: Story = {
  name: `${t("booking.form.fields.date")}: ${t("booking.validation.past")}`,
  play: ({ canvasElement }) => selectPastDate(canvasElement),
}

export const EditingSelf: Story = {
  name: t("booking.form.editTitle"),
  play: ({ canvasElement }) => editOwnMeeting(canvasElement),
}
