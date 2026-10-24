import { clock } from "./clock"

const TickMilliseconds = 1_000

function createClockStore() {
  const listeners = new Set<() => void>()
  let snapshot = clock.now()
  let timer: ReturnType<typeof setInterval> | undefined

  function refresh() {
    const now = clock.now()

    if (now.getTime() === snapshot.getTime()) return

    snapshot = now

    for (const listener of listeners) listener()
  }

  function subscribe(listener: () => void): () => void {
    refresh()
    listeners.add(listener)

    if (listeners.size === 1) {
      timer = setInterval(refresh, TickMilliseconds)
      window.addEventListener("focus", refresh)
      document.addEventListener("visibilitychange", refresh)
    }

    return () => {
      listeners.delete(listener)

      if (listeners.size > 0) return

      clearInterval(timer)
      timer = undefined
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }

  return {
    getSnapshot: (): Date => snapshot,
    subscribe,
  }
}

export const clockStore = createClockStore()
