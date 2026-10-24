import { fireEvent, userEvent, within } from "storybook/test"
import { BookingTestId } from "@/entities/booking"
import { EditorTestId } from "@/features/booking-editor"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { createI18n } from "@/shared/lib/i18n"

import { RuleDate } from "./scenarios"

const t = createI18n().t

export async function submitInterval(canvasElement: HTMLElement, start: string, end: string) {
  const canvas = within(canvasElement)
  const portal = within(canvasElement.ownerDocument.body)

  if (!portal.queryByTestId(EditorTestId.Form)) await userEvent.click(await canvas.findByTestId(SchedulerTestId.Create))

  fireEvent.change(await portal.findByTestId(EditorTestId.Start), { target: { value: start } })
  fireEvent.change(portal.getByTestId(EditorTestId.End), { target: { value: end } })
  fireEvent.change(portal.getByTestId(EditorTestId.Title), { target: { value: t("demo.meetings.planning") } })
  await userEvent.click(portal.getByTestId(EditorTestId.Submit))
}

export async function editOwnMeeting(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const cards = await canvas.findAllByTestId(BookingTestId.Card)
  const portal = within(canvasElement.ownerDocument.body)

  await userEvent.click(within(cards[0]).getByTestId(BookingTestId.Edit))
  fireEvent.change(await portal.findByTestId(EditorTestId.Title), { target: { value: t("demo.uiKit.primaryAction") } })
  await userEvent.click(portal.getByTestId(EditorTestId.Submit))
}

export async function selectPastDate(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)

  fireEvent.change(await canvas.findByTestId(SchedulerTestId.DateInput), { target: { value: RuleDate.Past } })
}
