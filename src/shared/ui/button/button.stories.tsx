import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ButtonVariant } from "@/shared/config"
import { Button } from "./index"

const t = createI18n().t

const meta = {
  title: "UI Kit/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: t("booking.form.submit") },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = { args: { variant: ButtonVariant.Secondary } }

export const Loading: Story = { args: { loading: true, children: t("booking.form.sending") } }

export const Disabled: Story = { args: { disabled: true } }
