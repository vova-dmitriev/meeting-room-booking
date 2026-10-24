import type { Page } from "@playwright/test"
import { ThemeTestId } from "@/shared/lib/theme"
import { ThemeFixture } from "./fixtures"

interface ThemeSample {
  theme: string | undefined
  canvas: string
}

type ThemeWindow = Window & {
  themeSamples: ThemeSample[]
  stopThemeCapture: () => void
}

export async function captureThemeFrames(page: Page): Promise<void> {
  await page.getByTestId(ThemeTestId.Root).evaluate((root) => {
    const browser = window as unknown as ThemeWindow
    let frame: number

    browser.themeSamples = []

    function sample() {
      browser.themeSamples.push({ theme: document.documentElement.dataset.theme, canvas: getComputedStyle(root).backgroundColor })
      frame = requestAnimationFrame(sample)
    }

    browser.stopThemeCapture = () => cancelAnimationFrame(frame)
    sample()
  })
}

export async function readThemeFrames(page: Page): Promise<ThemeSample[]> {
  return page.evaluate(async (frames) => {
    for (let index = 0; index < frames; index += 1) await new Promise(requestAnimationFrame)

    const browser = window as unknown as ThemeWindow

    browser.stopThemeCapture()

    return browser.themeSamples
  }, ThemeFixture.Frames)
}
