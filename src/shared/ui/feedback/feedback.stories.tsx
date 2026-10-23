import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Tone } from "@/shared/config"
import { Feedback } from "./feedback"

const t = createI18n().t

const meta = {
  title: "UI Kit/Feedback",
  component: Feedback,
  tags: ["autodocs"],
  args: { title: t("booking.feedback.success.title"), description: t("booking.feedback.success.description"), tone: Tone.Success },
} satisfies Meta<typeof Feedback>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Conflict: Story = {
  args: { title: t("booking.feedback.conflict.title"), description: t("booking.feedback.conflict.description"), tone: Tone.Danger },
}
