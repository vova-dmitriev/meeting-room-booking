import { clock } from "@/shared/lib/clock"
import { DemoNow } from "@/entities/booking"
import { useCallback, useEffect, useState } from "react"
import { BootstrapPhase } from "./bootstrap-values"
import { startMockApi } from "./start-mock-api"

export function useMockBootstrap() {
  const [phase, setPhase] = useState<BootstrapPhase>(BootstrapPhase.Loading)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => {
    setPhase(BootstrapPhase.Loading)
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    let active = true

    clock.now = () => new Date(DemoNow)

    void startMockApi()
      .then(() => {
        if (active) setPhase(BootstrapPhase.Ready)
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Mock API bootstrap failed", error)
          setPhase(BootstrapPhase.Error)
        }
      })

    return () => {
      active = false
    }
  }, [attempt])

  return { phase, retry }
}
