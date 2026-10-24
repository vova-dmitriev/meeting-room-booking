import { expect, test } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { DeleteTestId } from "@/features/delete-booking"
import { ButtonTestId } from "@/shared/ui/button"
import { SelectFieldTestId } from "@/shared/ui/select-field"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { DialogTestId } from "@/shared/ui/dialog"
import { expectControlBorder, expectTouchTarget } from "./control-metrics"

for (const theme of ["light", "dark"] as const) {
  test(`${theme} field colors follow the selected theme rather than the operating system`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto(`/iframe.html?id=preview-booking-workspace--default&viewMode=story&globals=theme:${theme}`)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
    await page.getByTestId(SchedulerTestId.Create).click()

    const field = page.getByTestId(EditorTestId.Title)
    const background = await field.evaluate((element) => getComputedStyle(element).backgroundColor)

    await page.emulateMedia({ colorScheme: "dark" })
    await expect.poll(() => field.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(background)
  })

  test(`${theme} workspace fields retain visible borders and 44px touch targets`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" })
    await page.goto(`/iframe.html?id=preview-booking-workspace--default&viewMode=story&globals=theme:${theme}`)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)
    await page.getByTestId(SchedulerTestId.Create).click()

    for (const id of [EditorTestId.Date, EditorTestId.Start, EditorTestId.End, EditorTestId.Title]) {
      await expectControlBorder(page.getByTestId(id))
      await expectTouchTarget(page.getByTestId(id))
    }
  })

  test(`${theme} compact workspace buttons retain 44px touch targets`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" })
    await page.goto(`/iframe.html?id=preview-booking-workspace--default&viewMode=story&globals=theme:${theme}`)
    await expect(page.getByTestId(BookingTestId.Card)).toHaveCount(3)

    await expectTouchTarget(page.getByTestId(PageTestId.Theme))
    await expectTouchTarget(page.getByTestId(SchedulerTestId.Create))
    await expectTouchTarget(page.getByTestId(SchedulerTestId.Previous))
    await expectTouchTarget(page.getByTestId(SchedulerTestId.Next))

    for (const card of await page.getByTestId(BookingTestId.Card).all()) {
      await expectTouchTarget(card.getByTestId(BookingTestId.Edit))
    }

    await page.getByTestId(BookingTestId.Card).first().getByTestId(BookingTestId.Edit).click()
    await expectTouchTarget(page.getByTestId(EditorTestId.Submit))
    await expectTouchTarget(page.getByTestId(DeleteTestId.Trigger))
    await expectTouchTarget(page.getByTestId(DialogTestId.Close))
  })

  test(`${theme} UI kit outlined button and select retain visible borders and 44px targets`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light" })
    await page.goto(`/iframe.html?id=ui-kit-button--secondary&viewMode=story&globals=theme:${theme}`)
    await expectControlBorder(page.getByTestId(ButtonTestId.Root))
    await expectTouchTarget(page.getByTestId(ButtonTestId.Root))
    await page.goto(`/iframe.html?id=ui-kit-selectfield--default&viewMode=story&globals=theme:${theme}`)
    await expectControlBorder(page.getByTestId(SelectFieldTestId.Select))
    await expectTouchTarget(page.getByTestId(SelectFieldTestId.Select))
  })
}
