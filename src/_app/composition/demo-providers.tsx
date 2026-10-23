"use client"

import { AppProviders } from "./app-providers"
import { useMockBootstrap } from "./lifecycle/use-mock-bootstrap"
import type { ProviderProps } from "./provider.types"

export function DemoProviders({ children }: ProviderProps) {
  const ready = useMockBootstrap()

  if (!ready) return null

  return <AppProviders>{children}</AppProviders>
}
