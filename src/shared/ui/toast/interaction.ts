import { ToastTestId } from "./test-ids"

export function isToastInteraction(target: EventTarget | null) {
  return target instanceof Node && Boolean(document.getElementById(ToastTestId.Root)?.contains(target))
}
