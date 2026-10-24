import { useEffect, useRef } from "react"
import { useSelectDate, useSelectedDate } from "../selectors"
import { dateFromSearch, urlWithDate } from "./date-url"

export function useDateUrl(enabled: boolean) {
  const date = useSelectedDate()
  const selectDate = useSelectDate()
  const previousDate = useRef(date)

  useEffect(() => {
    if (!enabled) return

    const restoreDate = () => {
      const restored = dateFromSearch(window.location.search)

      previousDate.current = restored
      selectDate(restored)
    }

    window.addEventListener("popstate", restoreDate)

    return () => {
      window.removeEventListener("popstate", restoreDate)
    }
  }, [enabled, selectDate])

  useEffect(() => {
    if (!enabled || previousDate.current === date) return

    previousDate.current = date
    window.history.pushState(window.history.state, "", urlWithDate(window.location.href, date))
  }, [date, enabled])
}
