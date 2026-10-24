import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BootstrapPhase } from "@/_app/composition/lifecycle/bootstrap-values"
import { BootstrapStatus } from "../bootstrap-status"
import { Theme } from "@/shared/config"

const meta = {
  title: "App/Bootstrap status",
  component: BootstrapStatus,
  args: { phase: BootstrapPhase.Loading, onRetry: () => {} },
  tags: ["autodocs"],
} satisfies Meta<typeof BootstrapStatus>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {}

export const Error: Story = { args: { phase: BootstrapPhase.Error } }

export const DarkError: Story = { args: { phase: BootstrapPhase.Error }, globals: { theme: Theme.Dark } }
