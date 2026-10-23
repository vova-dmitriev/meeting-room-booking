import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Tone } from "@/shared/config"
import { Badge } from "./badge"

const t = createI18n().t

const meta = {
  title: "UI Kit/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: t("room.available"), tone: Tone.Success, dot: true },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Neutral: Story = { args: { tone: Tone.Neutral, children: t("booking.schedule.occupied") } }

export const Warning: Story = { args: { tone: Tone.Warning, children: t("demo.uiKit.warning") } }
