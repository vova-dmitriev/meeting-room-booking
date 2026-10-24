import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AppBootstrap } from "@/_app/composition"
import { ru } from "@/shared/lib/i18n/dictionaries/ru"
import { themeInitScript } from "@/shared/lib/theme"
import { DocumentTestId } from "@/shared/config/test-ids"
import "@/_app/styles/globals.css"

export const metadata: Metadata = { title: ru.metadata.title, description: ru.metadata.description }

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru" data-testid={DocumentTestId.Root} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  )
}
