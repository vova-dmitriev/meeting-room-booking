import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Surface } from "./surface"

const t = createI18n().t

const meta = {
  title: "UI Kit/Surface",
  component: Surface,
  tags: ["autodocs"],
  args: { children: t("workspace.greeting"), className: "p-8" },
} satisfies Meta<typeof Surface>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
