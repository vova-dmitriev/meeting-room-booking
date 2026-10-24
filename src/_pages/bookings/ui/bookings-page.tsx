"use client"

import { BookingScheduler } from "@/widgets/booking-scheduler"
import type { BookingsPageProps } from "../model/types"
import { WorkspaceShell } from "./workspace-shell/workspace-shell"
import { PageTestId } from "../config/test-ids"

export function BookingsPage({ scenario }: BookingsPageProps) {
  return (
    <WorkspaceShell>
      <div id="room" data-testid={PageTestId.Room}>
        <BookingScheduler scenario={scenario} />
      </div>
    </WorkspaceShell>
  )
}
