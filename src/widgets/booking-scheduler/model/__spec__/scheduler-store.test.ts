import { describe, expect, it, vi } from "vitest"
import { clock } from "@/shared/lib/clock"
import type { Booking } from "@/entities/booking"
import { createSchedulerStore } from "@/widgets/booking-scheduler/model/scheduler-store"
import { schedulerFixture } from "./scheduler-store.fixtures"

const { booking, otherBooking, nextDate } = schedulerFixture

describe("scheduler store actions", () => {
  it("initializes the selected day from the current Moscow clock", () => {
    const now = vi.spyOn(clock, "now").mockReturnValue(new Date(schedulerFixture.initialClock.instant))

    try {
      expect(createSchedulerStore().getState().date).toBe(schedulerFixture.initialClock.date)
    } finally {
      now.mockRestore()
    }
  })

  it("starts and cancels editing while preserving the selected date", () => {
    const store = createSchedulerStore(booking.date)
    const actions = store.getState()

    actions.startEditing(booking)
    expect(store.getState().editing).toBe(booking)
    actions.cancelEditing()
    expect(store.getState().editing).toBeUndefined()
    expect(store.getState().date).toBe(booking.date)
    expect(store.getState().startEditing).toBe(actions.startEditing)
    expect(store.getState().cancelEditing).toBe(actions.cancelEditing)
  })

  it("changes the date and clears editing in one state transition", () => {
    const store = createSchedulerStore(booking.date)

    store.getState().startEditing(booking)

    const transitions: Array<{ date: string; editing?: Booking }> = []
    const unsubscribe = store.subscribe((state) => transitions.push({ date: state.date, editing: state.editing }))

    store.getState().selectDate(nextDate)
    unsubscribe()
    expect(transitions).toEqual([{ date: nextDate, editing: undefined }])
  })

  it("does not share editing or selection between scoped stores", () => {
    const first = createSchedulerStore(booking.date)
    const second = createSchedulerStore(booking.date)

    first.getState().startEditing(booking)
    first.getState().selectDate(nextDate)
    expect(second.getState().date).toBe(booking.date)
    expect(second.getState().editing).toBeUndefined()
    expect(first.getState().selectDate).not.toBe(second.getState().selectDate)
  })

  it("clears only the currently edited booking after deletion", () => {
    const store = createSchedulerStore(booking.date)

    store.getState().startEditing(booking)
    store.getState().bookingDeleted(otherBooking.id)
    expect(store.getState().editing).toBe(booking)
    store.getState().bookingDeleted(booking.id)
    expect(store.getState().editing).toBeUndefined()
    expect(store.getState().date).toBe(booking.date)
  })

  it("preserves a different editor selected while deletion was pending", () => {
    const store = createSchedulerStore(booking.date)
    const other = otherBooking

    store.getState().startEditing(booking)

    const completeDeletion = store.getState().bookingDeleted

    store.getState().startEditing(other)
    completeDeletion(booking.id)
    expect(store.getState().editing).toBe(other)
  })
})
