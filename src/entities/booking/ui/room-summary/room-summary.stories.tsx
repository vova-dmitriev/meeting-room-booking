import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { RoomSummary } from "./room-summary"

const meta = { title: "Booking/Room summary", component: RoomSummary, tags: ["autodocs"] } satisfies Meta<typeof RoomSummary>

export default meta

export const Default: StoryObj<typeof meta> = {}
