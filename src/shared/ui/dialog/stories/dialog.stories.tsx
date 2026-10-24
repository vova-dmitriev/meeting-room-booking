import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { createI18n } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { TextField } from "@/shared/ui/text-field"
import { ModalDialog } from "../dialog"
import { DialogTestId } from "../test-ids"

const t = createI18n().t

const meta = {
  title: "UI Kit/Dialog",
  component: ModalDialog,
  args: { open: true, onOpenChange: () => {}, title: t("booking.form.createTitle"), children: null },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button id="dialog-story-trigger" data-testid={DialogTestId.Trigger} onClick={() => setOpen(true)}>
          {t("booking.form.createAction")}
        </Button>
        <ModalDialog {...args} open={open} onOpenChange={setOpen} returnFocusId="dialog-story-trigger">
          <TextField id="dialog-story-title" label={t("booking.form.fields.title")} />
        </ModalDialog>
      </>
    )
  },
} satisfies Meta<typeof ModalDialog>

export default meta

export const Default: StoryObj<typeof meta> = {}
