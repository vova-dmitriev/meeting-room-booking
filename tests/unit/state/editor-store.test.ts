import { describe, expect, it } from "vitest"
import { BookingError, DemoDate, type Booking } from "@/entities/booking"
import { createEditorStore } from "@/features/booking-editor/model/editor-store"
import { PreviewState } from "@/shared/config"

const options = { date: DemoDate, bookings: [], onCancel: () => undefined }

describe("editor store actions", () => {
  it("updates one draft field atomically and clears obsolete validation and success state", () => {
    const store = createEditorStore(options)
    const actions = store.getState()

    actions.setError(BookingError.Duration)
    actions.setSuccess(true)
    actions.setConflict(true)
    actions.setRefreshFailed(true)
    actions.updateDraft("title", "Планирование релиза")

    expect(store.getState()).toMatchObject({
      draft: { date: DemoDate, start: "10:00", end: "11:00", title: "Планирование релиза" },
      error: null,
      success: false,
      conflict: true,
      refreshFailed: true,
    })

    expect(store.getState().updateDraft).toBe(actions.updateDraft)
    expect(store.getState().setError).toBe(actions.setError)
  })

  it("preserves the other draft fields when editing a start time", () => {
    const booking: Booking = { id: "own", date: DemoDate, title: "Планирование релиза", start: "12:00", end: "13:00" }
    const store = createEditorStore({ ...options, editing: booking })

    store.getState().updateDraft("start", "12:30")

    expect(store.getState().draft).toMatchObject({ ...booking, start: "12:30" })
  })

  it.each([
    ["start", "13:00"],
    ["end", "14:00"],
    ["date", "2026-10-24"],
  ] as const)("clears obsolete server feedback when %s changes, preserving the rest of the draft", (field, value) => {
    const booking: Booking = { id: "own", date: DemoDate, title: "Планирование релиза", start: "12:00", end: "13:00" }
    const store = createEditorStore({ ...options, editing: booking })
    const actions = store.getState()

    actions.setConflict(true)
    actions.setRefreshFailed(true)
    actions.setError(BookingError.Conflict)
    actions.setSuccess(true)
    actions.updateDraft(field, value)

    expect(store.getState()).toMatchObject({
      draft: { ...booking, [field]: value },
      conflict: false,
      refreshFailed: false,
      error: null,
      success: false,
    })
  })

  it("provides independent scoped drafts and preview validation state", () => {
    const first = createEditorStore({ ...options, scenario: PreviewState.Invalid })
    const second = createEditorStore(options)

    expect(first.getState().error).toBe(BookingError.Duration)
    first.getState().updateDraft("title", "Изменённая встреча")
    first.getState().setSuccess(true)

    expect(second.getState().draft.title).toBe("")
    expect(second.getState().error).toBeNull()
    expect(second.getState().success).toBe(false)
  })

  it("sets and clears server feedback without changing the draft", () => {
    const store = createEditorStore(options)
    const draft = store.getState().draft

    store.getState().setConflict(true)
    store.getState().setRefreshFailed(true)
    store.getState().setSuccess(true)
    store.getState().setError(BookingError.Conflict)
    expect(store.getState()).toMatchObject({ conflict: true, refreshFailed: true, success: true, error: BookingError.Conflict })
    store.getState().setConflict(false)
    store.getState().setRefreshFailed(false)
    store.getState().setSuccess(false)
    store.getState().setError(null)
    expect(store.getState()).toMatchObject({ conflict: false, refreshFailed: false, success: false, error: null })
    expect(store.getState().draft).toBe(draft)
  })
})
