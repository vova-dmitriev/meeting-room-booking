import { useState } from "react"
import { EditorContext } from "@/features/booking-editor/model/editor-context"
import { createEditorStore } from "@/features/booking-editor/model/editor-store"
import type { EditorProviderProps } from "./editor-provider.types"

export function EditorProvider({ options, children }: EditorProviderProps) {
  const [store] = useState(() => {
    return createEditorStore(options)
  })

  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}
