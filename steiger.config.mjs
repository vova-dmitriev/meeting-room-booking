import { defineConfig } from "steiger"
import fsd from "@feature-sliced/steiger-plugin"

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js reserves src/app and src/pages; these are the documented FSD aliases.
    files: ["./src/_app/**", "./src/_pages/**"],
    rules: { "fsd/typo-in-layer-name": "off" },
  },
  {
    // Keep these single-page booking workflows in separate slices (explicit user decision).
    files: ["./src/features/booking-editor/**", "./src/features/delete-booking/**", "./src/widgets/booking-scheduler/**"],
    rules: { "fsd/insignificant-slice": "off" },
  },
])
