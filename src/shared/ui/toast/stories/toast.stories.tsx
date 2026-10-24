import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Theme } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { notifySuccess } from "../notify"
import { ToastTestId } from "../test-ids"

const t = createI18n().t

const meta = {
  title: "UI kit/Toast",
  component: Button,
  args: { children: t("common.save"), onClick: () => notifySuccess(t("booking.feedback.success.title")) },
  render: (args) => <Button {...args} data-testid={ToastTestId.Trigger} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId(ToastTestId.Trigger))
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Saved: Story = {}

export const Updated: Story = { args: { onClick: () => notifySuccess(t("booking.feedback.success.updatedTitle")) } }

export const Dark: Story = { globals: { theme: Theme.Dark } }
