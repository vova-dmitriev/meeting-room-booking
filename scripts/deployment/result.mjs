export function deploymentUrl(result) {
  const deployment = result?.deployment

  if (result?.status !== "ok" || deployment?.readyState !== "READY" || deployment.target !== "production") {
    throw new Error("A ready production deployment is required")
  }

  const url = new URL(deployment.productionUrl)

  if (
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
