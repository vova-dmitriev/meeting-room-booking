import type { Page } from "@playwright/test"

const SaveTransport = { Path: "/api/bookings", Before: "navigationBeforeSave", After: "navigationAfterSave" } as const

export async function holdNavigationSave(page: Page) {
  let release = () => {}

  let started = false
  let completed = false

  const pending = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.exposeFunction(SaveTransport.Before, async () => {
    started = true
    await pending
  })

  await page.exposeFunction(SaveTransport.After, () => {
    completed = true
  })

  await page.evaluate((config) => {
    const originalFetch = window.fetch.bind(window)
    const callbacks = window as unknown as Record<string, () => Promise<void>>

    window.fetch = async (input, init) => {
      const request = new Request(input, init)

      if (new URL(request.url).pathname !== config.Path || request.method !== "POST") return originalFetch(input, init)

      await callbacks[config.Before]()

      const response = await originalFetch(request)

      await callbacks[config.After]()

      return response
    }
  }, SaveTransport)

  return { release, hasStarted: () => started, hasCompleted: () => completed }
}
