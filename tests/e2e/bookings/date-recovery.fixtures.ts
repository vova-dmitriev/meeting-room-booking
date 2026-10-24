import type { Page } from "@playwright/test"
import type { Booking, BookingInput } from "@/entities/booking"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export const DateRecoveryValue = {
  Date: "2026-11-02",
  Start: "10:00",
  End: "11:00",
  FreeStart: "12:00",
  FreeEnd: "13:00",
  Title: t("demo.meetings.planning"),
  LoadError: t("booking.feedback.loadError.title"),
  Overlap: t("booking.validation.overlap"),
  Story: "/iframe.html?id=preview-booking-workspace--default&viewMode=story",
} as const

export const DateRecoveryDraft = {
  Rejected: {
    date: DateRecoveryValue.Date,
    start: DateRecoveryValue.Start,
    end: DateRecoveryValue.End,
    title: DateRecoveryValue.Title,
  },
  Free: {
    date: DateRecoveryValue.Date,
    start: DateRecoveryValue.FreeStart,
    end: DateRecoveryValue.FreeEnd,
    title: DateRecoveryValue.Title,
  },
} satisfies Record<string, BookingInput>

const concurrent: Booking = {
  ...DateRecoveryDraft.Rejected,
  id: "date-recovery-concurrent",
  title: t("demo.meetings.designReview"),
}

interface DateReply {
  status: number
  bookings: Booking[]
}

interface DateRequest {
  method: string
  input?: BookingInput
}

export const DateRecoveryReply = {
  Unavailable: { status: 503, bookings: [] },
  Empty: { status: 200, bookings: [] },
  Concurrent: { status: 200, bookings: [concurrent] },
} satisfies Record<string, DateReply>

const apiOrigin = "https://api.storybook.local"
const bookingsPath = "/bookings"
const dateParameter = "date"
const bridgeName = "dateRecoveryRequest"
const readMethod = "GET"
const writeMethod = "POST"

export async function installDateRecoveryApi(page: Page) {
  let reply: DateReply = DateRecoveryReply.Unavailable
  let readAttempts = 0
  let hold: Promise<void> | undefined
  const writes: BookingInput[] = []

  await page.exposeFunction(bridgeName, async ({ method, input }: DateRequest) => {
    if (method === writeMethod && input) {
      writes.push(input)
      const created: Booking = { ...input, id: "date-recovery-saved" }

      reply = { status: 200, bookings: [...reply.bookings, created] }

      return { status: 201, body: created }
    }

    readAttempts += 1
    const pending = hold

    hold = undefined
    await pending

    return { status: reply.status, body: reply.bookings }
  })

  await page.evaluate(
    ({ origin, path, parameter, targetDate, bridge, read, write }) => {
      const originalFetch = window.fetch.bind(window)
      const callbacks = window as unknown as Record<string, (request: DateRequest) => Promise<{ status: number; body: unknown }>>

      window.fetch = async (input, init) => {
        const request = new Request(input, init)
        const url = new URL(request.url)

        if (url.origin === origin && url.pathname === path) {
          const booking = request.method === write ? ((await request.clone().json()) as BookingInput) : undefined

          if ((request.method === read && url.searchParams.get(parameter) === targetDate) || booking?.date === targetDate) {
            const response = await callbacks[bridge]({ method: request.method, input: booking })

            return Response.json(response.body, { status: response.status })
          }
        }

        return originalFetch(input, init)
      }
    },
    {
      origin: apiOrigin,
      path: bookingsPath,
      parameter: dateParameter,
      targetDate: DateRecoveryValue.Date,
      bridge: bridgeName,
      read: readMethod,
      write: writeMethod,
    },
  )

  return {
    get readAttempts() {
      return readAttempts
    },
    writes,
    respondWith(next: DateReply) {
      reply = next
    },
    holdNextRead() {
      let release = () => {}

      hold = new Promise<void>((resolve) => {
        release = resolve
      })

      return { release }
    },
  }
}
