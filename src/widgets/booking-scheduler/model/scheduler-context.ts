import { useStore } from "zustand"
import { createContext, useContext } from "react"
import type { createSchedulerStore, SchedulerState } from "./scheduler-store"

export const SchedulerContext = createContext<ReturnType<typeof createSchedulerStore> | null>(null)

export const useSchedulerStore = <T>(selector: (state: SchedulerState) => T): T => {
  const store = useContext(SchedulerContext)

  if (!store) throw new Error("SchedulerProvider is required")

  return useStore(store, selector)
}
