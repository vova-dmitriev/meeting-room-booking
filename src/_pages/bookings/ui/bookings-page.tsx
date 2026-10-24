"use client"

import { BookingScheduler } from "@/widgets/booking-scheduler"
import type { BookingsPageProps } from "../model/types"
import { WorkspaceShell } from "./workspace-shell/workspace-shell"
import { PageTestId } from "../config/test-ids"

export function BookingsPage({ scenario, syncDateUrl = false }: BookingsPageProps) {
  return (
    <WorkspaceShell>
      <div id="room" data-testid={PageTestId.Room}>
        <BookingScheduler scenario={scenario} syncDateUrl={syncDateUrl} />
      </div>
    </WorkspaceShell>
  )
}
