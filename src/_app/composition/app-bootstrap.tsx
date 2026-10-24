"use client"

import { AppProviders } from "./app-providers"
import { BootstrapGate } from "./bootstrap-gate/bootstrap-gate"
import type { ProviderProps } from "./provider.types"

export function AppBootstrap({ children, theme }: ProviderProps) {
  return (
    <AppProviders theme={theme}>
      <BootstrapGate>{children}</BootstrapGate>
    </AppProviders>
  )
}
