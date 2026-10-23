import { expect, type Locator } from "@playwright/test"

export async function expectTouchTarget(control: Locator) {
  await expect(control).toBeVisible()

  const size = await control.boundingBox()

  expect(size?.width).toBeGreaterThanOrEqual(44)
  expect(size?.height).toBeGreaterThanOrEqual(44)
}

export async function expectControlBorder(control: Locator) {
  await expect(control).toBeVisible()

  const metrics = await control.evaluate((element) => {
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })

    if (!context) throw new Error("Canvas color conversion is unavailable")

    function color(value: string): number[] {
      context!.clearRect(0, 0, 1, 1)
      context!.fillStyle = value
      context!.fillRect(0, 0, 1, 1)

      return Array.from(context!.getImageData(0, 0, 1, 1).data)
    }

    function composite(foreground: number[], background: number[]) {
      const alpha = foreground[3] / 255

      return foreground.slice(0, 3).map((channel, index) => channel * alpha + background[index] * (1 - alpha))
    }

    function luminance(rgb: number[]) {
      const linear = rgb.map((channel) => {
        const value = channel / 255

        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })

      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
    }

    function contrast(first: number[], second: number[]) {
      const values = [luminance(first), luminance(second)].sort((a, b) => a - b)

      return (values[1] + 0.05) / (values[0] + 0.05)
    }

    const ancestors: Element[] = []
    let ancestor = element.parentElement

    while (ancestor) {
      ancestors.unshift(ancestor)
      ancestor = ancestor.parentElement
    }

    const outside = ancestors.reduce((paint, node) => composite(color(getComputedStyle(node).backgroundColor), paint), [255, 255, 255])
    const style = getComputedStyle(element)
    const inside = composite(color(style.backgroundColor), outside)
    const border = composite(color(style.borderTopColor), inside)

    return {
      borderColor: style.borderTopColor,
      borderWidth: Number.parseFloat(style.borderTopWidth),
      inside,
      outside,
      insideContrast: contrast(border, inside),
      outsideContrast: contrast(border, outside),
    }
  })

  expect(metrics.borderWidth).toBeGreaterThanOrEqual(1)
  expect(metrics.insideContrast, JSON.stringify(metrics)).toBeGreaterThanOrEqual(3)
  expect(metrics.outsideContrast, JSON.stringify(metrics)).toBeGreaterThanOrEqual(3)
}
