import { expect, test } from "@playwright/test"
import { ThemeTestId } from "@/shared/lib/theme"
import { SelectFieldTestId } from "@/shared/ui/select-field"
import { SelectTimeValue } from "../booking.fixtures"

for (const theme of ["light", "dark"] as const) {
  test(`system theme starts ${theme} and follows operating system changes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto("/iframe.html?id=ui-kit-theme--system&viewMode=story")

    const toggle = page.getByTestId(ThemeTestId.Toggle)

    await expect(toggle).toHaveAttribute("data-theme", theme)

    await expect(page.getByTestId(ThemeTestId.Root).last()).toHaveCSS(
      "background-color",
      theme === "dark" ? "rgb(31, 39, 52)" : "rgb(246, 247, 244)",
    )

    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" })
    await expect(toggle).toHaveAttribute("data-theme", theme === "light" ? "dark" : "light")
  })

  test(`explicit ${theme} theme overrides operating system preference`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" })
    await page.goto(`/iframe.html?id=ui-kit-theme--${theme}&viewMode=story`)

    const toggle = page.getByTestId(ThemeTestId.Toggle)

    await expect(toggle).toHaveAttribute("data-theme", theme)
    await page.emulateMedia({ colorScheme: theme })
    await expect(toggle).toHaveAttribute("data-theme", theme)
    await toggle.click()
    await expect(toggle).toHaveAttribute("data-theme", theme === "light" ? "dark" : "light")
  })
}

test("manual toggle remains selected after operating system changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" })
  await page.goto("/iframe.html?id=ui-kit-theme--system&viewMode=story")

  const toggle = page.getByTestId(ThemeTestId.Toggle)

  await expect(toggle).toHaveAttribute("data-theme", "light")
  await toggle.click()
  await expect(toggle).toHaveAttribute("data-theme", "dark")
  await page.emulateMedia({ colorScheme: "dark" })
  await page.emulateMedia({ colorScheme: "light" })
  await expect(toggle).toHaveAttribute("data-theme", "dark")
  await toggle.click()
  await expect(toggle).toHaveAttribute("data-theme", "light")
})

test("select chevron is inset while the native select remains usable", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-kit-selectfield--default&viewMode=story")

  const select = page.getByTestId(SelectFieldTestId.Select)
  const chevron = page.getByTestId(SelectFieldTestId.Chevron)

  await expect(chevron).toBeVisible()
  const selectBox = await select.boundingBox()
  const chevronBox = await chevron.boundingBox()

  expect(selectBox).not.toBeNull()
  expect(chevronBox).not.toBeNull()
  expect(selectBox!.x + selectBox!.width - chevronBox!.x - chevronBox!.width).toBe(15)
  await expect(select).toHaveCSS("appearance", "none")
  await expect(chevron).toHaveCSS("pointer-events", "none")
  await select.selectOption(SelectTimeValue)
  await expect(select).toHaveValue(SelectTimeValue)
})
