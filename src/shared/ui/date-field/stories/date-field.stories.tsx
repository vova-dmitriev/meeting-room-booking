import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { createI18n } from "@/shared/lib/i18n"
import { DateField } from "../date-field"

const t = createI18n().t

const meta = {
  title: "UI Kit/Date field",
  component: DateField,
  args: { id: "date-field-story", label: t("booking.form.fields.date"), defaultValue: "2026-10-23" },
} satisfies Meta<typeof DateField>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Disabled: StoryObj<typeof meta> = { args: { disabled: true } }
