import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PreviewState, Theme } from "@/shared/config"
import { BookingsPage } from "../bookings-page"

const meta = {
  title: "Preview/Booking workspace",
  component: BookingsPage,
  parameters: { layout: "fullscreen" },
  args: { scenario: PreviewState.Default },
} satisfies Meta<typeof BookingsPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = { globals: { theme: Theme.Dark } }

export const Mobile: Story = { globals: { viewport: { value: "mobile1", isRotated: false } } }

export const Empty: Story = { args: { scenario: PreviewState.Empty }, parameters: { scenario: PreviewState.Empty } }

export const Loading: Story = { args: { scenario: PreviewState.Loading }, parameters: { scenario: PreviewState.Loading } }

export const Error: Story = { args: { scenario: PreviewState.Error }, parameters: { scenario: PreviewState.Error } }

export const Conflict: Story = { args: { scenario: PreviewState.Conflict }, parameters: { scenario: PreviewState.Conflict } }

export const Submitting: Story = { args: { scenario: PreviewState.Sending } }

export const ValidationError: Story = { args: { scenario: PreviewState.Invalid } }
