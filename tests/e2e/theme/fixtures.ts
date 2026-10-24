import { Theme } from "@/shared/config"
import { BootstrapFixture } from "../bootstrap/bootstrap.fixtures"

export const ThemeFixture = {
  Origin: process.env.APPLICATION_TEST_URL ?? process.env.DEPLOYMENT_URL ?? BootstrapFixture.Origin,
  StoragePath: "/theme-storage-test",
  StorageKey: "meeting-room-theme",
  InvalidPreference: "automatic",
  SystemStory: "/iframe.html?id=ui-kit-theme--system&viewMode=story",
  LightStory: "/iframe.html?id=ui-kit-theme--light&viewMode=story",
  DarkStory: "/iframe.html?id=ui-kit-theme--dark&viewMode=story",
  NoErrors: 0,
  Frames: 5,
  Dark: { theme: Theme.Dark, opposite: Theme.Light, canvas: "rgb(31, 39, 52)", panel: "#252d3c", ink: "rgb(242, 245, 255)" },
  Light: { theme: Theme.Light, opposite: Theme.Dark, canvas: "rgb(246, 247, 244)", panel: "#fff", ink: "rgb(32, 43, 39)" },
} as const

export const ThemeScenarios = [ThemeFixture.Light, ThemeFixture.Dark] as const

export const ThemePrepaintScenarios = ThemeScenarios.flatMap((scenario) => [
  { ...scenario, saved: scenario.theme, system: scenario.opposite, source: "stored" },
  { ...scenario, saved: undefined, system: scenario.theme, source: "system" },
])
