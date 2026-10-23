"use client"

import { BookingScheduler } from "@/widgets/booking-scheduler"
import type { BookingsPageProps } from "../model/types"
import { WorkspaceShell } from "./workspace-shell/workspace-shell"
import { PageIntro } from "./page-intro/page-intro"

export function BookingsPage({ scenario }: BookingsPageProps) {
  return (
    <WorkspaceShell>
      <PageIntro />
      <div id="room">
        <BookingScheduler scenario={scenario} />
      </div>
    </WorkspaceShell>
  )
}
