import { useEditorStore } from "./editor-context"

export const useBookingDraft = () => useEditorStore((state) => state.draft)

export const useEditorError = () => useEditorStore((state) => state.error)

export const useEditorConflict = () => useEditorStore((state) => state.conflict)

export const useEditorRefreshFailed = () => useEditorStore((state) => state.refreshFailed)

export const useEditorSuccess = () => useEditorStore((state) => state.success)

export const useUpdateDraft = () => useEditorStore((state) => state.updateDraft)

export const useSetEditorError = () => useEditorStore((state) => state.setError)

export const useSetEditorConflict = () => useEditorStore((state) => state.setConflict)

export const useSetEditorRefreshFailed = () => useEditorStore((state) => state.setRefreshFailed)

export const useSetEditorSuccess = () => useEditorStore((state) => state.setSuccess)
