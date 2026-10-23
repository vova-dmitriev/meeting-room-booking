import { PageTestId } from "@/_pages/bookings/config/test-ids"
import { Sidebar } from "../sidebar/sidebar"
import { WorkspaceHeader } from "../workspace-header/workspace-header"
import { WorkspaceFooter } from "../workspace-footer/workspace-footer"
import type { WorkspaceShellProps } from "./workspace-shell.types"

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <div data-testid={PageTestId.Root} className="flex min-h-screen bg-canvas text-ink">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <WorkspaceHeader />
        <main id="main" data-testid={PageTestId.Content} className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-9 xl:px-10">
          {children}
          <WorkspaceFooter />
        </main>
      </div>
    </div>
  )
}
