import { useState } from "react"
import { SchedulerContext } from "@/widgets/booking-scheduler/model/scheduler-context"
import { createSchedulerStore } from "@/widgets/booking-scheduler/model/scheduler-store"
import { dateFromSearch } from "@/widgets/booking-scheduler/model/navigation/date-url"
import type { SchedulerProviderProps } from "./scheduler-provider.types"

export function SchedulerProvider({ children, syncDateUrl = false }: SchedulerProviderProps) {
  const [store] = useState(() => {
    const date = syncDateUrl && typeof window !== "undefined" ? dateFromSearch(window.location.search) : undefined

    return createSchedulerStore(date)
  })

  return <SchedulerContext.Provider value={store}>{children}</SchedulerContext.Provider>
}
