import { describe, expect, it } from "vitest"
import { DemoDate, type Booking } from "@/entities/booking"
import { createSchedulerStore } from "@/widgets/booking-scheduler/model/scheduler-store"

const booking: Booking = { id: "own", date: DemoDate, title: "Планирование релиза", start: "10:00", end: "11:00" }

describe("scheduler store actions", () => {
  it("starts and cancels editing while preserving the selected date", () => {
    const store = createSchedulerStore()
    const actions = store.getState()

    actions.startEditing(booking)
    expect(store.getState().editing).toBe(booking)
    actions.cancelEditing()
    expect(store.getState().editing).toBeUndefined()
    expect(store.getState().date).toBe(DemoDate)
    expect(store.getState().startEditing).toBe(actions.startEditing)
    expect(store.getState().cancelEditing).toBe(actions.cancelEditing)
  })

  it("changes the date and clears editing in one state transition", () => {
    const store = createSchedulerStore()

    store.getState().startEditing(booking)

    const transitions: Array<{ date: string; editing?: Booking }> = []
    const unsubscribe = store.subscribe((state) => transitions.push({ date: state.date, editing: state.editing }))

    store.getState().selectDate("2026-10-24")
    unsubscribe()
    expect(transitions).toEqual([{ date: "2026-10-24", editing: undefined }])
  })

  it("does not share editing or selection between scoped stores", () => {
    const first = createSchedulerStore()
    const second = createSchedulerStore()

    first.getState().startEditing(booking)
    first.getState().selectDate("2026-10-24")
    expect(second.getState().date).toBe(DemoDate)
    expect(second.getState().editing).toBeUndefined()
    expect(first.getState().selectDate).not.toBe(second.getState().selectDate)
  })

  it("clears only the currently edited booking after deletion", () => {
    const store = createSchedulerStore()

    store.getState().startEditing(booking)
    store.getState().bookingDeleted("other")
    expect(store.getState().editing).toBe(booking)
    store.getState().bookingDeleted(booking.id)
    expect(store.getState().editing).toBeUndefined()
    expect(store.getState().date).toBe(DemoDate)
  })

  it("preserves a different editor selected while deletion was pending", () => {
    const store = createSchedulerStore()
    const other = { ...booking, id: "other" }

    store.getState().startEditing(booking)

    const completeDeletion = store.getState().bookingDeleted

    store.getState().startEditing(other)
    completeDeletion(booking.id)
    expect(store.getState().editing).toBe(other)
  })
})
