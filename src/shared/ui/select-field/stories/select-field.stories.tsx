import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { SelectField } from "../index"

const t = createI18n().t

const meta = {
  title: "UI Kit/SelectField",
  component: SelectField,
  tags: ["autodocs"],
  args: {
    id: "meeting-time",
    label: t("booking.form.fields.start"),
    options: [
      { value: "10:00", label: "10:00" },
      { value: "10:30", label: "10:30" },
    ],
  },
} satisfies Meta<typeof SelectField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }
