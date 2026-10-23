import { delay, http, HttpResponse } from "msw"
import { DemoNow, BookingError, validateBooking, type Booking, type BookingInput } from "@/entities/booking"
import { PreviewState } from "@/shared/config"
import { seedBookings } from "./fixtures"
import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export function createHandlers(origin: string, scenario: PreviewState = PreviewState.Default) {
  let bookings: Booking[] = scenario === PreviewState.Empty ? [] : structuredClone(seedBookings)
  let pendingConflict = scenario === PreviewState.Conflict

  async function write(request: Request, id?: string) {
    await delay(scenario === PreviewState.Sending ? 4000 : 350)
    const input = (await request.json()) as BookingInput

    if (id && !bookings.some((booking) => booking.id === id)) return HttpResponse.json({ code: "NOT_FOUND" }, { status: 404 })

    if (pendingConflict) {
      pendingConflict = false
      bookings.push({ ...input, id: "concurrent", title: t("demo.meetings.interview") })

      return HttpResponse.json({ code: "CONFLICT" }, { status: 409 })
    }

    const errors = validateBooking(input, { bookings, now: new Date(DemoNow), excludeId: id })

    if (errors.length) return HttpResponse.json({ code: errors[0] }, { status: errors[0] === BookingError.Conflict ? 409 : 400 })
    const booking = { ...input, id: id ?? crypto.randomUUID(), host: t("demo.meetings.hostThree"), people: 2 }

    bookings = [...bookings.filter((item) => item.id !== booking.id), booking]

    return HttpResponse.json(booking, { status: id ? 200 : 201 })
  }

  return [
    http.get(`${origin}/bookings`, async ({ request }) => {
      await delay(scenario === PreviewState.Loading ? "infinite" : 250)
      if (scenario === PreviewState.Error) return HttpResponse.json({ code: "UNAVAILABLE" }, { status: 503 })
      const date = new URL(request.url).searchParams.get("date")

      return HttpResponse.json(bookings.filter((booking) => booking.date === date).sort((a, b) => a.start.localeCompare(b.start)))
    }),
    http.post(`${origin}/bookings`, ({ request }) => write(request)),
    http.patch(`${origin}/bookings/:id`, ({ request, params }) => write(request, String(params.id))),
    http.delete(`${origin}/bookings/:id`, async ({ params }) => {
      await delay(200)
      bookings = bookings.filter((booking) => booking.id !== params.id)

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
