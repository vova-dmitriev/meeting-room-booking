import { useStore } from "zustand"
import { createContext, useContext } from "react"
import type { EditorStore, EditorState } from "./editor-store"

export const EditorContext = createContext<EditorStore | null>(null)

export const useEditorStore = <T>(selector: (state: EditorState) => T): T => {
  const store = useContext(EditorContext)

  if (!store) throw new Error("EditorProvider is required")

  return useStore(store, selector)
}
