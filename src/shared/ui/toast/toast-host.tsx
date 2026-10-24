"use client"

import { useEffect, type CSSProperties } from "react"
import { Toaster, toast } from "sonner"
import { X } from "lucide-react"
import { useTheme } from "@/shared/lib/theme"
import { useTranslation } from "@/shared/lib/i18n"
import { ToastSetting } from "./settings"
import { ToastTestId } from "./test-ids"

export function ToastHost() {
  const { theme } = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      toast.dismiss()
    }
  }, [])

  return (
    <div id={ToastTestId.Root} data-testid={ToastTestId.Root} data-theme={theme}>
      <Toaster
        className="pointer-events-auto"
        theme={theme}
        position="top-right"
        offset={ToastSetting.Offset}
        mobileOffset={ToastSetting.MobileOffset}
        duration={ToastSetting.Duration}
        containerAriaLabel={t("common.notifications")}
        closeButton
        icons={{
          close: (
            <span data-testid={ToastTestId.Close} className="flex size-full items-center justify-center">
              <X size={16} aria-hidden />
            </span>
          ),
        }}
        style={
          {
            "--normal-bg": "var(--panel)",
            "--normal-text": "var(--ink)",
            "--normal-border": "var(--control-border)",
          } as CSSProperties
        }
        toastOptions={{
          closeButtonAriaLabel: t("common.close"),
          classNames: {
            toast: "rounded-xl! pr-14!",
            closeButton: "top-1! right-1! left-auto! size-11! transform-none! rounded-lg! border-0! bg-transparent!",
          },
        }}
      />
    </div>
  )
}
