import type { BootstrapGateProps } from "./bootstrap-gate.types"
import { BootstrapPhase } from "../lifecycle/bootstrap-values"
import { useMockBootstrap } from "../lifecycle/use-mock-bootstrap"
import { BootstrapStatus } from "../bootstrap-status/bootstrap-status"
import { BootstrapTestId } from "../bootstrap-status/test-ids"

export function BootstrapGate({ children }: BootstrapGateProps) {
  const { phase, retry } = useMockBootstrap()

  return (
    <div data-testid={BootstrapTestId.Root} className="min-h-screen">
      {phase === BootstrapPhase.Ready ? children : <BootstrapStatus phase={phase} onRetry={retry} />}
    </div>
  )
}
