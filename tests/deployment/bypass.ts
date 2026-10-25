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

// Vercel Protection Bypass for Automation handshake: the secret rides the documented
// x-vercel-protection-bypass header, and x-vercel-set-bypass-cookie makes Vercel issue
// its own bypass cookie for the origin. The cookie's name and shape stay Vercel's.
async function bypassCookies(target: BypassTarget, api: APIRequestContext): Promise<Cookie[]> {
  const origin = new URL(target.url)

  const response = await api.get(target.url, {
    headers: {
      "x-vercel-protection-bypass": target.secret,
      "x-vercel-set-bypass-cookie": "true",
    },
  })

  const issued = (await api.storageState()).cookies.filter((cookie) => cookie.domain.replace(/^\./, "") === origin.hostname)

  if (!issued.length) {
    throw new Error(`Vercel deployment protection did not issue a bypass cookie for ${origin.hostname} (HTTP ${response.status()})`)
  }

  return issued
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
