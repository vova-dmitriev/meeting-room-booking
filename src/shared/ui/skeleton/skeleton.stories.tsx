import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Skeleton } from "./skeleton"

const meta = { title: "UI Kit/Skeleton", component: Skeleton, tags: ["autodocs"], args: { className: "h-20 w-80" } } satisfies Meta<
  typeof Skeleton
>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
