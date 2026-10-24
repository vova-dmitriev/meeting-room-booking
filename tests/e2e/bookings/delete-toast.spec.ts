import { expect, test } from "@playwright/test"
import { DeleteTestId } from "@/features/delete-booking"
import { createI18n } from "@/shared/lib/i18n"
import { HttpStatus } from "@/shared/api"
import { ToastTestId } from "@/shared/ui/toast"

const t = createI18n().t
const deleteSuccess = t("booking.delete.success")

test("failed deletion keeps confirmation open without announcing success", async ({ page }) => {
  const deletion = page.waitForResponse((response) => response.request().method() === "DELETE")

  await page.goto("/iframe.html?id=booking-delete-booking--server-error&viewMode=story")
  expect((await deletion).status()).toBe(HttpStatus.Unavailable)
  await expect(page.getByTestId(DeleteTestId.Error)).toBeVisible()
  await expect(page.getByTestId(DeleteTestId.Dialog)).toBeVisible()
  await expect(page.getByTestId(ToastTestId.Message).filter({ hasText: deleteSuccess })).toHaveCount(0)
})

test("pending deletion announces success only after its API response", async ({ page }) => {
  const deletion = page.waitForResponse((response) => response.request().method() === "DELETE")

  await page.goto("/iframe.html?id=booking-delete-booking--pending&viewMode=story")
  await expect(page.getByTestId(DeleteTestId.Confirm)).toBeDisabled()
  await expect(page.getByTestId(ToastTestId.Message).filter({ hasText: deleteSuccess })).toHaveCount(0)
  expect((await deletion).status()).toBe(HttpStatus.NoContent)
  await expect(page.getByTestId(DeleteTestId.Dialog)).toHaveCount(0)
  await expect(page.getByTestId(ToastTestId.Message).filter({ hasText: deleteSuccess })).toBeVisible()
})
