import "i18next"
import type { ru } from "./dictionaries/ru"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: { translation: typeof ru }
    strictKeyChecks: true
  }
}
