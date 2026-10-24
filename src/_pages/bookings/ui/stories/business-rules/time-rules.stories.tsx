import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BookingRule } from "@/entities/booking"
import { RuleInterval } from "./scenarios"
import { PreviewState } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { BookingsPage } from "@/_pages/bookings/ui/bookings-page"
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
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.StartBeforeWorkday.start, RuleInterval.StartBeforeWorkday.end),
}

export const StartAfterWorkday: Story = {
  name: `${t("booking.form.fields.start")}: ${t("booking.feedback.loadError.title")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.StartAfterWorkday.start, RuleInterval.StartAfterWorkday.end),
}

export const EndBeforeWorkday: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.feedback.loadError.title")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.EndBeforeWorkday.start, RuleInterval.EndBeforeWorkday.end),
}

export const EndAfterWorkday: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.validation.workday")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.EndAfterWorkday.start, RuleInterval.EndAfterWorkday.end),
}

export const EqualTimes: Story = {
  name: `${t("booking.form.fields.start")}: ${t("booking.validation.order")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.Equal.start, RuleInterval.Equal.end),
}

export const ReversedTimes: Story = {
  name: `${t("booking.form.fields.end")}: ${t("booking.validation.order")}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.Reversed.start, RuleInterval.Reversed.end),
}

export const BelowMinimum: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: BookingRule.MinDuration - 1 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.BelowMinimum.start, RuleInterval.BelowMinimum.end),
}

export const AboveMaximum: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: BookingRule.MaxDuration + 1 })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.AboveMaximum.start, RuleInterval.AboveMaximum.end),
}

export const MinimumDuration: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: BookingRule.MinDuration })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.Minimum.start, RuleInterval.Minimum.end),
}

export const MaximumDuration: Story = {
  name: `${t("booking.form.duration")}: ${t("common.minutes", { count: BookingRule.MaxDuration })}`,
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.Maximum.start, RuleInterval.Maximum.end),
}

export const OffStep: Story = {
  name: t("booking.validation.step"),
  play: ({ canvasElement }) => submitInterval(canvasElement, RuleInterval.OffStep.start, RuleInterval.OffStep.end),
}
