import { createI18n } from "@/shared/lib/i18n"

const t = createI18n().t

export const BootstrapFixture = {
  Origin: "http://127.0.0.1:3100",
  RegistrationError: "Temporary service worker registration failure",
  ResumeRegistration: "bootstrap-test-resume-registration",
  ResumeData: "bootstrap-test-resume-data",
  BookingsPath: "/bookings",
  RoomCopy: `${t("room.name")} ${t("room.type")} · ${t("room.capacity")} · ${t("workspace.timezone")}`,
  ListSkeletons: 3,
  EmptyCount: 0,
  InitialBookings: 3,
  SkeletonFonts: [
    { name: "platform font", style: "" },
    { name: "Arial font", style: "body { font-family: Arial, sans-serif; }" },
  ],
} as const
