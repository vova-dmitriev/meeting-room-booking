import type { BootstrapPhase } from "../lifecycle/bootstrap-values"

export interface BootstrapStatusProps {
  phase: Exclude<BootstrapPhase, "ready">
  onRetry: () => void
}
