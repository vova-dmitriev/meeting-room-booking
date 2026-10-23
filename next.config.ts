import type { NextConfig } from "next"

const config: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    ...(process.env.VALIDATION_TEST_WORKERS ? { cpus: Number(process.env.VALIDATION_TEST_WORKERS) } : {}),
  },
}

export default config
