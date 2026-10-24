import type { Page } from "@playwright/test"
import { BootstrapFixture } from "./bootstrap.fixtures"

export async function holdBootstrapAndData(page: Page) {
  await page.addInitScript(
    ({ workerEvent, dataEvent, path }) => {
      const register = navigator.serviceWorker.register.bind(navigator.serviceWorker)
      const originalFetch = window.fetch.bind(window)
      const browser = window as unknown as { bootstrapReads: number }
      const workerReleased = new Promise<void>((resolve) => window.addEventListener(workerEvent, () => resolve(), { once: true }))
      const dataReleased = new Promise<void>((resolve) => window.addEventListener(dataEvent, () => resolve(), { once: true }))

      browser.bootstrapReads = 0

      navigator.serviceWorker.register = async (...args) => {
        await workerReleased

        return register(...args)
      }

      window.fetch = async (input, init) => {
        const request = new Request(input, init)

        if (request.method === "GET" && new URL(request.url).pathname.endsWith(path)) {
          browser.bootstrapReads += 1
          await dataReleased
        }

        return originalFetch(input, init)
      }
    },
    {
      workerEvent: BootstrapFixture.ResumeRegistration,
      dataEvent: BootstrapFixture.ResumeData,
      path: BootstrapFixture.BookingsPath,
    },
  )
}

export function readBootstrapRequests(page: Page) {
  return page.evaluate(() => (window as unknown as { bootstrapReads: number }).bootstrapReads)
}
