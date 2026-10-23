import { fireEvent, userEvent, within } from "storybook/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export async function submitInterval(canvasElement: HTMLElement, start: string, end: string) {
  const canvas = within(canvasElement)

  fireEvent.change(await canvas.findByTestId(EditorTestId.Start), { target: { value: start } })
  fireEvent.change(canvas.getByTestId(EditorTestId.End), { target: { value: end } })
  fireEvent.change(canvas.getByTestId(EditorTestId.Title), { target: { value: t("demo.meetings.planning") } })
  await userEvent.click(canvas.getByTestId(EditorTestId.Submit))
}

export async function editOwnMeeting(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const cards = await canvas.findAllByTestId(BookingTestId.Card)

  await userEvent.click(within(cards[0]).getByTestId(BookingTestId.Edit))
  fireEvent.change(canvas.getByTestId(EditorTestId.Title), { target: { value: t("demo.uiKit.primaryAction") } })
  await userEvent.click(canvas.getByTestId(EditorTestId.Submit))
}

export async function selectPastDate(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const days = await canvas.findAllByTestId(SchedulerTestId.Day)
  const yesterday = days.find((day) => day.getAttribute("data-date") === "2026-10-22")

  if (yesterday) await userEvent.click(yesterday)
}
