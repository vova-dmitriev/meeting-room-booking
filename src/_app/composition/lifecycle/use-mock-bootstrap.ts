import { clock } from "@/shared/lib/clock"
import { DemoNow } from "@/entities/booking"
import { useEffect, useState } from "react"

export function useMockBootstrap() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    clock.now = () => new Date(DemoNow)

    void Promise.all([import("../../api/mock/browser"), import("../../api/mock/handlers")])
      .then(async ([{ worker }, { createHandlers }]) => {
        worker.use(...createHandlers(`${window.location.origin}/api`))
        await worker.start({ onUnhandledRequest: "bypass" })
        if (active) setReady(true)
      })
      .catch((error: unknown) => {
        console.error("Mock API bootstrap failed", error)
      })

    return () => {
      active = false
    }
  }, [])

  return ready
}
