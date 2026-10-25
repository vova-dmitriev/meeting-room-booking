const BypassCookieName = "_vercel_protection_bypass"

interface BypassCookieSource {
  url: string | undefined
  secret: string | undefined
}

function bypassCookie({ url, secret }: BypassCookieSource) {
  if (!url || !secret) return undefined

  const target = new URL(url)

  if (target.protocol !== "https:") return undefined

  return {
    name: BypassCookieName,
    value: secret,
    domain: target.hostname,
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: true,
    sameSite: "Lax" as const,
  }
}

// Vercel Deployment Protection bypass: one secret per project, so each candidate origin
// receives its own cookie. Absent environment values keep local and CI runs untouched.
export function protectionBypassState() {
  const cookies = [
    bypassCookie({
      url: process.env.DEPLOYMENT_URL ?? process.env.APPLICATION_TEST_URL,
      secret: process.env.VERCEL_APP_BYPASS_SECRET,
    }),
    bypassCookie({ url: process.env.STORYBOOK_DEPLOYMENT_URL, secret: process.env.VERCEL_STORYBOOK_BYPASS_SECRET }),
  ].filter((cookie) => cookie !== undefined)

  return cookies.length ? { cookies, origins: [] } : undefined
}
