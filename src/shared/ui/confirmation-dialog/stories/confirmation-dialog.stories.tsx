import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { createI18n } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { ConfirmationDialog } from "../confirmation-dialog"

const t = createI18n().t

const meta = {
  title: "UI Kit/Confirmation dialog",
  component: ConfirmationDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => {},
    trigger: <Button>{t("common.delete")}</Button>,
    title: t("booking.delete.title"),
    description: t("booking.delete.description"),
    confirmLabel: t("booking.delete.confirm"),
    cancelLabel: t("common.cancel"),
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return <ConfirmationDialog {...args} open={open} onOpenChange={setOpen} onConfirm={() => setOpen(false)} />
  },
} satisfies Meta<typeof ConfirmationDialog>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const Pending: StoryObj<typeof meta> = { args: { pending: true } }
