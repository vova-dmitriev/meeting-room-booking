import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Theme } from "@/shared/config"
import { BookingScheduleSkeleton } from "../booking-schedule-skeleton"

const meta = {
  title: "Booking/Schedule skeleton",
  component: BookingScheduleSkeleton,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BookingScheduleSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = { globals: { theme: Theme.Dark } }

export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } }
