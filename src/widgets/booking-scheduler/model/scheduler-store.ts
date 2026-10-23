import { createStore } from "zustand/vanilla"
import { DemoDate, type Booking } from "@/entities/booking"

export interface SchedulerState {
  date: string
  editing?: Booking
  selectDate: (date: string) => void
  startEditing: (booking: Booking) => void
  cancelEditing: () => void
  bookingDeleted: (id: string) => void
}

export function createSchedulerStore() {
  return createStore<SchedulerState>()((set) => ({
    date: DemoDate,
    selectDate: (date) => set({ date, editing: undefined }),
    startEditing: (editing) => set({ editing }),
    cancelEditing: () => set({ editing: undefined }),
    bookingDeleted: (id) => set((state) => (state.editing?.id === id ? { editing: undefined } : state)),
  }))
}
