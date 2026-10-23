import { expect, test } from "@playwright/test"
import { ButtonTestId } from "@/shared/ui/button"

test("button supports keyboard focus and disabled state", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-kit-button--default&viewMode=story")

  const button = page.getByTestId(ButtonTestId.Root)

  await expect(button).toBeEnabled()
  await button.focus()
  await expect(button).toBeFocused()
  await page.goto("/iframe.html?id=ui-kit-button--disabled&viewMode=story")
  await expect(page.getByTestId(ButtonTestId.Root)).toBeDisabled()
})
