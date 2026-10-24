import { expect, test } from "@playwright/test"
import { EditorTestId } from "@/features/booking-editor"
import { createI18n } from "@/shared/lib/i18n"
import { BookingError } from "@/entities/booking"
import { DialogTestId } from "@/shared/ui/dialog"
import { BookingIntervals, BookingTitles } from "../booking.fixtures"

const t = createI18n().t
const intervalError = t("booking.validation.order")
const layoutTolerance = 1

const intervalScenarios = [
  { story: "booking-time-rules--equal-times", error: BookingError.Order },
  { story: "booking-availability-rules--overlap", error: BookingError.Conflict },
  { story: "booking-time-rules--above-maximum", error: BookingError.Duration },
  { story: "booking-time-rules--start-before-workday", error: BookingError.Time },
  { story: "booking-availability-rules--past-time", error: BookingError.Past },
  { story: "booking-time-rules--off-step", error: BookingError.Step },
] as const

for (const theme of ["light", "dark"] as const) {
  test(`${theme} interval error spans both time fields below their controls`, async ({ page }) => {
    await page.goto(`/iframe.html?id=booking-time-rules--equal-times&viewMode=story&globals=theme:${theme}`)

    const start = page.getByTestId(EditorTestId.Start)
    const end = page.getByTestId(EditorTestId.End)

    await expect(start).toHaveAttribute("aria-invalid", "true")
    await expect(start).toHaveAccessibleDescription(intervalError)
    await expect(end).toHaveAttribute("aria-invalid", "true")
    await expect(end).toHaveAccessibleDescription(intervalError)
    await expect(start).toHaveAttribute("aria-describedby", EditorTestId.TimeError)
    await expect(end).toHaveAttribute("aria-describedby", EditorTestId.TimeError)

    const startBounds = await start.boundingBox()
    const endBounds = await end.boundingBox()

    const descriptionBounds = await start.evaluate((input) => {
      const descriptionId = input.getAttribute("aria-describedby")
      const description = descriptionId ? document.getElementById(descriptionId) : null

      if (!description) throw new Error("Invalid interval must reference its visible description")

      const bounds = description.getBoundingClientRect()

      return { left: bounds.left, right: bounds.right, top: bounds.top }
    })

    if (!startBounds || !endBounds) throw new Error("Both time controls must be visible")

    expect(Math.abs(descriptionBounds.left - startBounds.x)).toBeLessThanOrEqual(layoutTolerance)
    expect(Math.abs(descriptionBounds.right - endBounds.x - endBounds.width)).toBeLessThanOrEqual(layoutTolerance)
    expect(descriptionBounds.top).toBeGreaterThanOrEqual(Math.max(startBounds.y + startBounds.height, endBounds.y + endBounds.height))
    await expect(page.getByTestId(EditorTestId.TimeError)).toHaveCount(1)

    await end.fill(BookingIntervals.Default.end)
    await expect(page.getByTestId(EditorTestId.TimeError)).toBeEmpty()

    for (const field of [start, end]) {
      await expect(field).not.toHaveAttribute("aria-invalid")
      await expect(field).not.toHaveAttribute("aria-describedby")
    }
  })
}

for (const theme of ["light", "dark"] as const) {
  for (const scenario of intervalScenarios) {
    test(`${theme} ${scenario.error} keeps title, submit and dialog stable when toggled`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${scenario.story}&viewMode=story&globals=theme:${theme}`)

      const start = page.getByTestId(EditorTestId.Start)
      const title = page.getByTestId(EditorTestId.Title)
      const submit = page.getByTestId(EditorTestId.Submit)
      const dialog = page.getByTestId(DialogTestId.Root)

      await expect(start).toHaveAccessibleDescription(t(scenario.error))
      await title.fill(BookingTitles.UpdatedRelease)
      await expect(start).not.toHaveAttribute("aria-describedby")
      await expect(page.getByTestId(EditorTestId.TimeError)).toBeEmpty()

      const stableBounds = {
        title: await title.boundingBox(),
        submit: await submit.boundingBox(),
        dialog: await dialog.boundingBox(),
      }

      await submit.click()
      await expect(start).toHaveAccessibleDescription(t(scenario.error))
      expect(await title.boundingBox()).toEqual(stableBounds.title)
      expect(await submit.boundingBox()).toEqual(stableBounds.submit)
      expect(await dialog.boundingBox()).toEqual(stableBounds.dialog)

      const errorFits = await page.getByTestId(EditorTestId.TimeError).evaluate((message) => {
        return message.scrollHeight <= message.clientHeight && message.scrollWidth <= message.clientWidth
      })

      expect(errorFits).toBe(true)
      await title.fill(BookingTitles.Release)
      await expect(start).not.toHaveAttribute("aria-describedby")
      await expect(page.getByTestId(EditorTestId.TimeError)).toBeEmpty()
      expect(await title.boundingBox()).toEqual(stableBounds.title)
      expect(await submit.boundingBox()).toEqual(stableBounds.submit)
      expect(await dialog.boundingBox()).toEqual(stableBounds.dialog)
    })
  }
}
