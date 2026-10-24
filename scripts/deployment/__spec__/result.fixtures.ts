const production = {
  id: "dpl_contract_fixture",
  url: "https://booking-unique.vercel.app",
  productionUrl: "https://booking.vercel.app",
  inspectorUrl: "https://vercel.com/example/booking/deployment",
  deploymentApiUrl: "https://api.vercel.com/v13/deployments/dpl_contract_fixture",
  readyState: "READY",
  target: "production",
} as const

export const CliDeployment = {
  ordinary: production,
  success: { status: "ok", deployment: production, message: "Deployment ready.", next: [] },
  verificationFailed: { status: "error", reason: "verification_failed", deployment: production, next: [] },
  checksFailed: { status: "error", reason: "checks_failed", deployment: production, failedCheckRuns: [], next: [] },
  actionRequired: { status: "action_required", reason: "missing_arguments", next: [] },
} as const
