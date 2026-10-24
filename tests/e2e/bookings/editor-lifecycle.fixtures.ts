import type { Page } from "@playwright/test"
import type { BookingInput } from "@/entities/booking"
import { DemoDate } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export const EditorLifecycleValue = {
  Story: "/iframe.html?id=preview-booking-workspace--default&viewMode=story",
  Date: DemoDate,
  TargetDate: "2026-11-02",
  Empty: "",
  FirstTitle: t("demo.meetings.planning"),
  NewTitle: t("demo.uiKit.primaryAction"),
  Start: "12:00",
  End: "13:00",
  NewStart: "15:30",
  NewEnd: "16:30",
  DateError: t("booking.validation.date"),
  LoadError: t("booking.feedback.loadError.title"),
  Retry: t("common.retry"),
} as const

export const EditorLifecycleCases = [
  { mode: "create", crossDate: false, sourceCount: 4 },
  { mode: "create", crossDate: true, sourceCount: 3 },
  { mode: "update", crossDate: false, sourceCount: 3 },
  { mode: "update", crossDate: true, sourceCount: 2 },
] as const

const transport = {
  origin: "https://api.storybook.local",
  path: "/bookings",
  before: "editorLifecycleBeforeRequest",
  after: "editorLifecycleAfterRequest",
  read: "GET",
  create: "POST",
  update: "PATCH",
  unavailable: 503,
} as const

interface LifecycleRequest {
  method: string
  input?: BookingInput
}

export async function installEditorLifecycleApi(page: Page, failRefresh = false) {
  const writes: BookingInput[] = []
  let completedWrites = 0

  let release = () => {}

  let failedRefreshes = 0

  const pending = new Promise<void>((resolve) => {
    release = resolve
  })

  await page.exposeFunction(transport.before, async ({ method, input }: LifecycleRequest) => {
    if (method !== transport.read && input) {
      writes.push(input)
      await pending
    }

    if (method === transport.read && failRefresh && completedWrites > 0 && failedRefreshes === 0) {
      failedRefreshes += 1

      return transport.unavailable
    }

    return null
  })

  await page.exposeFunction(transport.after, ({ method }: LifecycleRequest) => {
    if (method !== transport.read) completedWrites += 1
  })

  await page.evaluate((config) => {
    const originalFetch = window.fetch.bind(window)
    const callbacks = window as unknown as Record<string, (request: LifecycleRequest) => Promise<number | null>>

    window.fetch = async (input, init) => {
      const request = new Request(input, init)
      const url = new URL(request.url)
      const matches = url.origin === config.origin && url.pathname.startsWith(config.path)

      if (!matches) return originalFetch(input, init)
      const writing = request.method === config.create || request.method === config.update

      const metadata = {
        method: request.method,
        input: writing ? ((await request.clone().json()) as BookingInput) : undefined,
      }

      const status = await callbacks[config.before](metadata)

      if (status) return Response.json({}, { status })
      const response = await originalFetch(request)

      await callbacks[config.after](metadata)

      return response
    }
  }, transport)

  return {
    writes,
    release,
    get completedWrites() {
      return completedWrites
    },
    get failedRefreshes() {
      return failedRefreshes
    },
  }
}

export async function settleEditorCompletion(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve())
      })
    })
  })
}
