"use client"

import { ThemeProvider } from "@/shared/lib/theme"
import { useState } from "react"
import { I18nextProvider } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createI18n } from "@/shared/lib/i18n"
import { ToastHost } from "@/shared/ui/toast"
import type { ProviderProps } from "./provider.types"

export function AppProviders({ children, theme }: ProviderProps) {
  const [i18n] = useState(createI18n)

  const [client] = useState(() => {
    return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  })

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <ThemeProvider initialTheme={theme}>
          {children}
          <ToastHost />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  )
}
