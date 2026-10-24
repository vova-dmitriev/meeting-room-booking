import { clock } from "../src/shared/lib/clock"
import { DemoNow } from "../src/entities/booking"
import { apiClient } from "../src/shared/api"
import type { Preview } from "@storybook/nextjs-vite"
import { mswLoader } from "msw-storybook-addon/csf3"
import { worker } from "../src/_app/api/mock/browser"
import { AppProviders } from "../src/_app/composition"
import { createHandlers } from "../src/_app/api/mock/handlers"
import { PreviewState, Theme } from "../src/shared/config"
import "../src/_app/styles/globals.css"

clock.now = () => new Date(DemoNow)

apiClient.baseUrl = "https://api.storybook.local"

const loadMsw = mswLoader(async () => {
  await worker.start({
    serviceWorker: { url: new URL("mockServiceWorker.js", document.baseURI).pathname },
    onUnhandledRequest(request, print) {
      if (new URL(request.url).hostname === "api.storybook.local") print.error()
    },
  })

  return worker
})

const preview: Preview = {
  loaders: [
    async (context) => {
      clock.now = () => new Date(context.parameters.now ?? DemoNow)

      context.parameters.msw = {
        handlers: [
          ...(context.parameters.mockHandlers ?? []),
          ...createHandlers("https://api.storybook.local", context.parameters.scenario ?? PreviewState.Default),
        ],
      }

      await loadMsw(context)
    },
  ],
  decorators: [
    (Story, context) => (
      <AppProviders key={`${context.id}-${context.globals.theme}`} theme={context.globals.theme === Theme.Dark ? Theme.Dark : Theme.Light}>
        <Story />
      </AppProviders>
    ),
  ],
  globalTypes: { theme: { description: "Theme", toolbar: { title: "Theme", icon: "circlehollow", items: [Theme.Light, Theme.Dark] } } },
  initialGlobals: { theme: Theme.Light },
  parameters: { layout: "padded", a11y: { test: "error" }, backgrounds: { disable: true }, controls: { expanded: true } },
}

export default preview
