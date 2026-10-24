import { delay, http, HttpResponse } from "msw"
import { BookingError, validateBooking, type Booking, type BookingInput } from "@/entities/booking"
import { PreviewState } from "@/shared/config"
import { clock } from "@/shared/lib/clock"
import { seedBookings } from "./fixtures"
import { createI18n } from "@/shared/lib/i18n"
import { HttpStatus } from "@/shared/api"
import { MockLatency, MockBooking, MockErrorCode } from "./config"

const t = createI18n().t

export function createHandlers(origin: string, scenario: PreviewState = PreviewState.Default, now: () => Date = () => clock.now()) {
  let bookings: Booking[] = scenario === PreviewState.Empty ? [] : structuredClone(seedBookings)
  let pendingConflict = scenario === PreviewState.Conflict

  async function write(request: Request, id?: string) {
    await delay(scenario === PreviewState.Sending ? MockLatency.Sending : MockLatency.Write)
    const input = (await request.json()) as BookingInput

    if (id && !bookings.some((booking) => booking.id === id))
      return HttpResponse.json({ code: MockErrorCode.NotFound }, { status: HttpStatus.NotFound })

    const errors = validateBooking(input, { bookings, now: now(), excludeId: id })

    if (errors.length)
      return HttpResponse.json(
        { code: errors[0] },
        { status: errors[0] === BookingError.Conflict ? HttpStatus.Conflict : HttpStatus.BadRequest },
      )

    if (pendingConflict) {
      pendingConflict = false
      bookings.push({ ...input, id: MockBooking.ConcurrentId, title: t("demo.meetings.interview") })

      return HttpResponse.json({ code: MockErrorCode.Conflict }, { status: HttpStatus.Conflict })
    }

    const booking = { ...input, id: id ?? crypto.randomUUID(), host: t("demo.meetings.hostThree"), people: MockBooking.DefaultPeople }

    bookings = [...bookings.filter((item) => item.id !== booking.id), booking]

    return HttpResponse.json(booking, { status: id ? HttpStatus.Ok : HttpStatus.Created })
  }

  return [
    http.get(`${origin}/bookings`, async ({ request }) => {
      await delay(scenario === PreviewState.Loading ? "infinite" : MockLatency.Read)
      if (scenario === PreviewState.Error) return HttpResponse.json({ code: MockErrorCode.Unavailable }, { status: HttpStatus.Unavailable })
      const date = new URL(request.url).searchParams.get("date")

      return HttpResponse.json(bookings.filter((booking) => booking.date === date).sort((a, b) => a.start.localeCompare(b.start)))
    }),
    http.post(`${origin}/bookings`, ({ request }) => write(request)),
    http.patch(`${origin}/bookings/:id`, ({ request, params }) => write(request, String(params.id))),
    http.delete(`${origin}/bookings/:id`, async ({ params }) => {
      await delay(MockLatency.Delete)
      bookings = bookings.filter((booking) => booking.id !== params.id)

      return new HttpResponse(null, { status: HttpStatus.NoContent })
    }),
  ]
}
