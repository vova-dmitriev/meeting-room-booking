import { createI18n } from "@/shared/lib/i18n"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { ButtonVariant } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import { ErrorBoundary } from "../index"

const t = createI18n().t

function BreakableSection() {
  const [broken, setBroken] = useState(false)

  if (broken) throw new Error("Render failure")

  return (
    <Button variant={ButtonVariant.Secondary} onClick={() => setBroken(true)}>
      {t("demo.errorBoundary.break")}
    </Button>
  )
}

const meta = {
  title: "UI Kit/Error Boundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  args: { children: <BreakableSection /> },
} satisfies Meta<typeof ErrorBoundary>

export default meta

type Story = StoryObj<typeof meta>

export const Recovered: Story = {}
