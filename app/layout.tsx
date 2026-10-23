import type { Metadata } from "next"
import type { ReactNode } from "react"
import { DemoProviders } from "@/_app/composition"
import "@/_app/styles/globals.css"

export const metadata: Metadata = { title: "Gather: Meeting rooms", description: "Meeting room booking UI kit preview" }

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <DemoProviders>{children}</DemoProviders>
      </body>
    </html>
  )
}
