export function deploymentUrl(result) {
  const deployment = result?.deployment

  if (
    result?.status !== "ok" ||
    deployment?.readyState !== "READY" ||
    deployment.target !== "production" ||
    typeof deployment.id !== "string" ||
    !/^dpl_[\w-]+$/.test(deployment.id)
  ) {
    throw new Error("A ready production deployment is required")
  }

  const url = new URL(deployment.url)

  if (
    /[\r\n\t]/.test(deployment.url) ||
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".vercel.app") ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("A public Vercel production origin is required")
  }

  return url.origin
}
