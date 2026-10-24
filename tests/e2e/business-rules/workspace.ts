import { expect, type Page } from "@playwright/test"
import { PageTestId } from "@/_pages/bookings"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { createI18n } from "@/shared/lib/i18n"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { expectNoHorizontalOverflow } from "../bookings/workspace"

export const t = createI18n().t

const titleFieldLabel = `${t("booking.form.fields.title")} · ${t("common.optional")}`

export async function openRule(page: Page, storyId: string, editor: "played" | "create" | "closed" = "played") {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`)
  await expect(page.getByTestId(PageTestId.Root)).toBeVisible()

  if (editor === "create") await page.getByTestId(SchedulerTestId.Create).click()

  if (editor !== "closed") await expect(page.getByTestId(EditorTestId.Form)).toBeVisible()
}

export async function expectFieldError(
  page: Page,
  key: "booking.validation.order" | "booking.validation.duration" | "booking.validation.overlap",
) {
  const start = page.getByTestId(EditorTestId.Start)

  await expect(start).toHaveAttribute("aria-invalid", "true")
  await expect(start).toHaveAccessibleDescription(t(key))
}

export async function expectCreatedInterval(page: Page, start: string, end: string, count: number) {
  const cards = page.getByTestId(BookingTestId.Card)

  await expect(cards).toHaveCount(count)

  const intervals = await cards.allTextContents()

  expect(intervals.some((text) => text.includes(start) && text.includes(end))).toBe(true)
  await expectNoHorizontalOverflow(page)
}

export async function assertFormAccessibility(page: Page) {
  if (!(await page.getByTestId(EditorTestId.Form).count())) await page.getByTestId(SchedulerTestId.Create).click()

  await expect(page.getByTestId(EditorTestId.Form)).toBeVisible()
  await expect(page.getByTestId(EditorTestId.Start)).toHaveAccessibleName(t("booking.form.fields.start"))
  await expect(page.getByTestId(EditorTestId.End)).toHaveAccessibleName(t("booking.form.fields.end"))
  await expect(page.getByTestId(EditorTestId.Date)).toHaveAccessibleName(t("booking.form.fields.date"))
  await expect(page.getByTestId(EditorTestId.Title)).toHaveAccessibleName(titleFieldLabel)
  await expect(page.getByTestId(EditorTestId.Submit)).toBeEnabled()
  await page.getByTestId(EditorTestId.Title).focus()
  await page.getByTestId(EditorTestId.Title).press("Tab")
  await expect(page.getByTestId(EditorTestId.Submit)).toBeFocused()
  await expectNoHorizontalOverflow(page)
}
