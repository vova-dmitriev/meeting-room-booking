import { useState } from "react"
import { SchedulerContext } from "@/widgets/booking-scheduler/model/scheduler-context"
import { createSchedulerStore } from "@/widgets/booking-scheduler/model/scheduler-store"
import type { SchedulerProviderProps } from "./scheduler-provider.types"

export function SchedulerProvider({ children }: SchedulerProviderProps) {
  const [store] = useState(createSchedulerStore)

  return <SchedulerContext.Provider value={store}>{children}</SchedulerContext.Provider>
}
