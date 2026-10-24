let startup: Promise<void> | undefined

export function startMockApi(): Promise<void> {
  if (startup) return startup

  startup = Promise.all([import("@/_app/api/mock/browser"), import("@/_app/api/mock/handlers")])
    .then(async ([{ worker }, { createHandlers }]) => {
      worker.resetHandlers(...createHandlers(`${window.location.origin}/api`))

      try {
        await worker.start({
          serviceWorker: { url: new URL("mockServiceWorker.js", document.baseURI).pathname },
          onUnhandledRequest: "bypass",
        })
      } catch (error) {
        worker.stop()

        throw error
      }
    })
    .catch((error: unknown) => {
      startup = undefined

      throw error
    })

  return startup
}
