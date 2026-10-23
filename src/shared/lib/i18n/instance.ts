import { createInstance } from "i18next"
import { initReactI18next } from "react-i18next"
import { ru } from "./dictionaries/ru"

export function createI18n() {
  const instance = createInstance()

  void instance
    .use(initReactI18next)
    .init({ lng: "ru", fallbackLng: "ru", resources: { ru: { translation: ru } }, interpolation: { escapeValue: false }, initAsync: false })

  return instance
}
