import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Theme } from "@/shared/config"
import { BookingListSkeleton } from "../booking-list-skeleton"

const meta = {
  title: "Booking/List skeleton",
  component: BookingListSkeleton,
} satisfies Meta<typeof BookingListSkeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = { globals: { theme: Theme.Dark } }
