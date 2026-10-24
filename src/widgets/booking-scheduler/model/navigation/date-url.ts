import { clock, roomTime } from "@/shared/lib/clock"
import { parseCalendarDate } from "@/shared/lib/date"

const DateParameter = "date"

export function dateFromSearch(search: string, now = clock.now()): string {
  const date = new URLSearchParams(search).get(DateParameter)

  return date && parseCalendarDate(date) ? date : roomTime(now).date
}

export function urlWithDate(href: string, date: string): string {
  const url = new URL(href)

  url.searchParams.set(DateParameter, date)

  return `${url.pathname}${url.search}${url.hash}`
}
