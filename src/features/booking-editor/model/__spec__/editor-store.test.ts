import { describe, expect, it } from "vitest"
import { BookingError } from "@/entities/booking"
import { createEditorStore } from "@/features/booking-editor/model/editor-store"
import { PreviewState } from "@/shared/config"
import { editorFixture } from "./editor-store.fixtures"

const { options, booking, initialDraft, title, changedTitle, revisedStart, intervalEdits } = editorFixture

describe("editor store actions", () => {
  it("updates one draft field atomically and clears obsolete validation and success state", () => {
    const store = createEditorStore(options)
    const actions = store.getState()

    actions.setError(BookingError.Duration)
    actions.setSuccess(true)
    actions.setConflict(true)
    actions.setRefreshFailed(true)
    actions.updateDraft("title", title)

    expect(store.getState()).toMatchObject({
      draft: { ...initialDraft, title },
      error: null,
      success: false,
      conflict: true,
      refreshFailed: true,
    })

    expect(store.getState().updateDraft).toBe(actions.updateDraft)
    expect(store.getState().setError).toBe(actions.setError)
  })

  it("preserves the other draft fields when editing a start time", () => {
    const store = createEditorStore({ ...options, editing: booking })

    store.getState().updateDraft("start", revisedStart)

    expect(store.getState().draft).toMatchObject({ ...booking, start: revisedStart })
  })

  it.each(intervalEdits)("clears obsolete server feedback when %s changes, preserving the rest of the draft", (field, value) => {
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
    first.getState().updateDraft("title", changedTitle)
    first.getState().setSuccess(true)

    expect(second.getState().draft.title).toBe(initialDraft.title)
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
