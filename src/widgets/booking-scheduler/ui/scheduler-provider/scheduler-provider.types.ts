import type { ReactNode } from "react"

export interface SchedulerProviderProps {
  children: ReactNode
  syncDateUrl?: boolean
}
