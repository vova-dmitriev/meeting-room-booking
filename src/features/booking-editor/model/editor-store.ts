import { createStore } from "zustand/vanilla"
import { BookingError, BookingDraftDefaults, BookingField } from "@/entities/booking"
import { PreviewState } from "@/shared/config"
import type { BookingDraft, BookingFormProps } from "./types"

export interface EditorState {
  draft: BookingDraft
  error: BookingError | null
  conflict: boolean
  refreshFailed: boolean
  success: boolean
  updateDraft: (field: keyof BookingDraft, value: string) => void
  setError: (error: BookingError | null) => void
  setConflict: (conflict: boolean) => void
  setRefreshFailed: (refreshFailed: boolean) => void
  setSuccess: (success: boolean) => void
}

export type EditorStore = ReturnType<typeof createEditorStore>

export function createEditorStore({ date, editing, scenario, interval }: BookingFormProps) {
  return createStore<EditorState>()((set) => ({
    draft: { date, ...BookingDraftDefaults, ...interval, ...editing },
    error: scenario === PreviewState.Invalid ? BookingError.Duration : null,
    conflict: false,
    refreshFailed: false,
    success: false,
    updateDraft: (field, value) =>
      set((current) => ({
        draft: { ...current.draft, [field]: value },
        error: null,
        success: false,
        conflict: field === BookingField.Title ? current.conflict : false,
        refreshFailed: field === BookingField.Title ? current.refreshFailed : false,
      })),
    setError: (error) => set({ error }),
    setConflict: (conflict) => set({ conflict }),
    setRefreshFailed: (refreshFailed) => set({ refreshFailed }),
    setSuccess: (success) => set({ success }),
  }))
}
