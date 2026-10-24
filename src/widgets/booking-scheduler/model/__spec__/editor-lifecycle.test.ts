import { describe, expect, it } from "vitest"
import { createSchedulerStore } from "../scheduler-store"
import { schedulerFixture } from "./scheduler-store.fixtures"

const { booking, nextDate } = schedulerFixture

describe("editor opening sessions", () => {
  it("assigns a new session to every create and edit opening, even with the same booking and date", () => {
    const store = createSchedulerStore()
    const sessions = [store.getState().editorSession]

    store.getState().createBooking()
    sessions.push(store.getState().editorSession)
    store.getState().cancelEditing()
    store.getState().createBooking()
    sessions.push(store.getState().editorSession)
    store.getState().startEditing(booking)
    sessions.push(store.getState().editorSession)
    store.getState().startEditing(booking)
    sessions.push(store.getState().editorSession)
    expect(new Set(sessions).size).toBe(sessions.length)
    expect(sessions).toEqual([...sessions].sort((left, right) => left - right))
  })

  it("ignores both navigation and closing from a previously dismissed session", () => {
    const store = createSchedulerStore()

    store.getState().createBooking()
    const originalSession = store.getState().editorSession

    store.getState().cancelEditing()
    store.getState().startEditing(booking)
    const current = store.getState()

    store.getState().completeEditor(originalSession, nextDate)
    expect(store.getState()).toBe(current)
    expect(store.getState().date).toBe(booking.date)
    expect(store.getState().editorOpen).toBe(true)
    expect(store.getState().editing).toBe(booking)
  })

  it("atomically completes the current session and rejects completion after it has closed", () => {
    const store = createSchedulerStore()

    store.getState().startEditing(booking)
    const session = store.getState().editorSession
    const transitions: Array<{ date: string; open: boolean }> = []
    const unsubscribe = store.subscribe((state) => transitions.push({ date: state.date, open: state.editorOpen }))

    store.getState().completeEditor(session, nextDate)
    store.getState().completeEditor(session, booking.date)
    unsubscribe()
    expect(transitions).toEqual([{ date: nextDate, open: false }])
    expect(store.getState().editing).toBeUndefined()
    expect(store.getState().interval).toBeUndefined()
  })
})
