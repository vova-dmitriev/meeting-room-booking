"use client"

import { useSyncExternalStore } from "react"
import { clockStore } from "./clock-store"

export function useClock(): Date {
  return useSyncExternalStore(clockStore.subscribe, clockStore.getSnapshot, clockStore.getSnapshot)
}
