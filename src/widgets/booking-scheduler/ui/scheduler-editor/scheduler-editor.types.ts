import type { PreviewState } from "@/shared/config"
import type { SchedulerModel } from "@/widgets/booking-scheduler/model/types"

export interface SchedulerEditorProps {
  model: SchedulerModel
  scenario?: PreviewState
}
