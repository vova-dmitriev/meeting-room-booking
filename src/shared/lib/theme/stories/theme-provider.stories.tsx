import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Theme } from "@/shared/config"
import { createI18n } from "@/shared/lib/i18n"
import { Button } from "@/shared/ui/button"
import { ThemeContext } from "../theme-context"
import { ThemeProvider } from "../theme-provider"
import { ThemeTestId } from "../test-ids"

const t = createI18n().t

const meta = {
  title: "UI Kit/Theme",
  component: ThemeProvider,
  args: {
    children: (
      <ThemeContext.Consumer>
        {(value) => (
          <Button data-testid={ThemeTestId.Toggle} data-theme={value?.theme} onClick={value?.toggle}>
            {t("common.theme")}
          </Button>
        )}
      </ThemeContext.Consumer>
    ),
  },
} satisfies Meta<typeof ThemeProvider>

export default meta

type Story = StoryObj<typeof meta>

export const System: Story = {}

export const Light: Story = { args: { initialTheme: Theme.Light } }

export const Dark: Story = { args: { initialTheme: Theme.Dark } }
