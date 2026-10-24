import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { createI18n } from "@/shared/lib/i18n"
import { DayFeed } from "../day-feed"
import { DayFeedTestId } from "../test-ids"
import { Theme } from "@/shared/config"
import { DemoNow } from "@/entities/booking/config/booking-values"

const t = createI18n().t
const date = "2026-10-24"

const StoryClock = { Past: "2026-10-25T08:30:00", Elapsed: "11:23:01", Before: "08:30:00", Started: "10:30:00" } as const

const bookings = [
  { id: "planning", date, start: "10:00", end: "11:00", title: t("dayFeed.demoMeeting") },
  { id: "review", date, start: "14:00", end: "15:00", title: t("demo.meetings.designReview") },
]

const meta = {
  title: "Booking/Day feed",
  component: DayFeed,
  args: { date, bookings, now: new Date(DemoNow), onSelectInterval: () => {}, onEdit: () => {} },
  tags: ["autodocs"],
} satisfies Meta<typeof DayFeed>

export default meta

type Story = StoryObj<typeof meta>

export const Populated: Story = {}

export const FullFreeDay: Story = {
  args: { bookings: [] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId(DayFeedTestId.Free))
  },
}

export const PastDate: Story = { args: { now: new Date(StoryClock.Past) } }

export const PastEmptyDate: Story = { args: { bookings: [], now: new Date(StoryClock.Past) } }

export const ElapsedToday: Story = { args: { now: new Date(`${date}T${StoryClock.Elapsed}`) } }

export const TodayBeforeWorkday: Story = { args: { bookings: [], now: new Date(`${date}T${StoryClock.Before}`) } }

export const StartedMeeting: Story = { args: { now: new Date(`${date}T${StoryClock.Started}`) } }

export const Dark: Story = { globals: { theme: Theme.Dark } }
