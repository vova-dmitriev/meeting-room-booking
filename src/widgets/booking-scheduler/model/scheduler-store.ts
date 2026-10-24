import { createStore } from "zustand/vanilla"
import { clock, roomTime } from "@/shared/lib/clock"
import { BookingDraftDefaults, type Booking } from "@/entities/booking"

export interface SchedulerState {
  date: string
  editing?: Booking
  editorOpen: boolean
  editorSession: number
  interval?: { start: string; end: string }
  createBooking: (start?: string, end?: string) => void
  selectDate: (date: string) => void
  startEditing: (booking: Booking) => void
  cancelEditing: () => void
  bookingDeleted: (id: string) => void
  completeEditor: (session: number, date: string) => void
}

export function createSchedulerStore(date = roomTime(clock.now()).date) {
  return createStore<SchedulerState>()((set) => ({
    date,
    editorOpen: false,
    editorSession: 0,
    selectDate: (date) => set({ date, editing: undefined, editorOpen: false, interval: undefined }),
    startEditing: (editing) => set((state) => ({ editing, editorOpen: true, interval: undefined, editorSession: state.editorSession + 1 })),
    createBooking: (start = BookingDraftDefaults.start, end = BookingDraftDefaults.end) =>
      set((state) => ({ editing: undefined, editorOpen: true, interval: { start, end }, editorSession: state.editorSession + 1 })),
    cancelEditing: () => set({ editing: undefined, editorOpen: false, interval: undefined }),
    bookingDeleted: (id) => set((state) => (state.editing?.id === id ? { editing: undefined, editorOpen: false } : state)),
    completeEditor: (session, date) =>
      set((state) =>
        state.editorOpen && state.editorSession === session ? { date, editing: undefined, editorOpen: false, interval: undefined } : state,
      ),
  }))
}
