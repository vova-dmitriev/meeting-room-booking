import type { Page } from "@playwright/test"

export const SaveToastLayout = { MaxEdgeInset: 32, MaxTopInset: 48 } as const

const transport = {
  origin: "https://api.storybook.local",
  path: "/bookings",
  read: "GET",
  wait: "waitForSavedSchedule",
} as const

export async function holdSavedSchedule(page: Page) {
  let refreshes = 0

  let release = () => {}

  const pending = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.exposeFunction(transport.wait, async () => {
    refreshes += 1
    await pending
  })

  await page.evaluate((config) => {
    const originalFetch = window.fetch.bind(window)
    const callbacks = window as unknown as Record<string, () => Promise<void>>
    let written = false

    window.fetch = async (input, init) => {
      const request = new Request(input, init)
      const url = new URL(request.url)
      const matches = url.origin === config.origin && url.pathname.startsWith(config.path)

      if (matches && written && request.method === config.read) await callbacks[config.wait]()
      const response = await originalFetch(request)

      if (matches && request.method !== config.read && response.ok) written = true

      return response
    }
  }, transport)

  return {
    release,
    get refreshes() {
      return refreshes
    },
  }
}
