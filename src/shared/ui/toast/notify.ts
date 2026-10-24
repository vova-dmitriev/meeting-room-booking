import { toast } from "sonner"
import { ToastTestId } from "./test-ids"

export function notifySuccess(message: string) {
  return toast.success(message, { testId: ToastTestId.Message })
}
