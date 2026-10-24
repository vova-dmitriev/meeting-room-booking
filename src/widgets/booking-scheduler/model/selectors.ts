import { useSchedulerStore } from "./scheduler-context"

export const useSelectedDate = () => useSchedulerStore((state) => state.date)

export const useEditingBooking = () => useSchedulerStore((state) => state.editing)

export const useSelectDate = () => useSchedulerStore((state) => state.selectDate)

export const useStartEditing = () => useSchedulerStore((state) => state.startEditing)

export const useCancelEditing = () => useSchedulerStore((state) => state.cancelEditing)

export const useBookingDeleted = () => useSchedulerStore((state) => state.bookingDeleted)

export const useEditorOpen = () => useSchedulerStore((state) => state.editorOpen)

export const useInitialInterval = () => useSchedulerStore((state) => state.interval)

export const useCreateBooking = () => useSchedulerStore((state) => state.createBooking)

export const useEditorSession = () => useSchedulerStore((state) => state.editorSession)

export const useCompleteEditor = () => useSchedulerStore((state) => state.completeEditor)
