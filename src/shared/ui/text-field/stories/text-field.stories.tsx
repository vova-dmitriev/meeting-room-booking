import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { TextField } from "../text-field"

const t = createI18n().t

const meta = {
  title: "UI Kit/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: { id: "meeting-title", label: t("booking.form.fields.title"), placeholder: t("booking.form.fields.titlePlaceholder") },
} satisfies Meta<typeof TextField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { error: t("booking.validation.workday") } }

export const Disabled: Story = { args: { disabled: true } }
