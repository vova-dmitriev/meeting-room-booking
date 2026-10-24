import { PageTestId } from "@/_pages/bookings/config/test-ids"
import { WorkspaceFooter } from "../workspace-footer/workspace-footer"
import type { WorkspaceShellProps } from "./workspace-shell.types"

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div data-testid={PageTestId.Root} className="min-h-screen bg-panel text-ink">
      <main id="main" data-testid={PageTestId.Content} className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-8 sm:pb-8">
        {children}
        <WorkspaceFooter />
      </main>
    </div>
  )
}
