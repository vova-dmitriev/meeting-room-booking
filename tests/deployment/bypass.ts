import { request, type APIRequestContext, type Cookie } from "@playwright/test"

// Mirrors the Playwright storage state accepted by the `use.storageState` config option.
interface BypassStorageState {
  cookies: Cookie[]
  origins: []
}

interface BypassCandidate {
  url: string | undefined
  secret: string | undefined
}

interface BypassTarget {
  url: string
  secret: string
}

function bypassTarget({ url, secret }: BypassCandidate): BypassTarget | undefined {
  if (!url || !secret) return undefined

  if (new URL(url).protocol !== "https:") return undefined

  return { url, secret }
}

// Vercel Protection Bypass for Automation: protected origins answer the documented
// header handshake by issuing their own bypass cookie, whose name and shape stay Vercel's.
// Production aliases under Standard Protection are public and answer 200 without a
// challenge, so they need no bypass. Only an unanswered challenge (the SSO redirect)
// would leave the smoke suite staring at a login page and fails the release loudly.
async function bypassCookies(target: BypassTarget, api: APIRequestContext): Promise<Cookie[]> {
  const origin = new URL(target.url)

  const response = await api.get(target.url, {
    headers: {
      "x-vercel-protection-bypass": target.secret,
      "x-vercel-set-bypass-cookie": "true",
    },
  })

  const issued = (await api.storageState()).cookies.filter((cookie) => cookie.domain.replace(/^\./, "") === origin.hostname)

  if (issued.length) return issued

  const landed = new URL(response.url())

  if (landed.hostname === origin.hostname && response.ok()) return []

  throw new Error(
    `Vercel deployment protection did not admit the bypass for ${origin.hostname} ` +
      `(HTTP ${response.status()}, landed on ${landed.hostname})`,
  )
}

// One secret per Vercel project, so each candidate origin completes its own handshake.
// Absent environment values keep local and CI runs untouched.
export async function protectionBypassState(): Promise<BypassStorageState | undefined> {
  const targets = [
    bypassTarget({ url: process.env.DEPLOYMENT_URL ?? process.env.APPLICATION_TEST_URL, secret: process.env.VERCEL_APP_BYPASS_SECRET }),
    bypassTarget({ url: process.env.STORYBOOK_DEPLOYMENT_URL, secret: process.env.VERCEL_STORYBOOK_BYPASS_SECRET }),
  ].filter((target) => target !== undefined)

  if (!targets.length) return undefined

  const api = await request.newContext()

  try {
    const cookies = (await Promise.all(targets.map((target) => bypassCookies(target, api)))).flat()

    return { cookies, origins: [] }
  } finally {
    await api.dispose()
  }
}
