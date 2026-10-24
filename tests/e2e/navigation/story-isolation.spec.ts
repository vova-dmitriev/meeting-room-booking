import { expect, test } from "@playwright/test"
import { DemoDate } from "@/entities/booking"
import { SchedulerTestId } from "@/widgets/booking-scheduler"
import { NavigationFixture as fixture } from "./fixtures"

test("Storybook selection leaves iframe query parameters unchanged", async ({ page }) => {
  await page.goto(`${fixture.Story}&date=${fixture.First}`)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(DemoDate)

  const original = page.url()

  await page.getByTestId(SchedulerTestId.DateInput).fill(fixture.Second)
  await expect(page.getByTestId(SchedulerTestId.DateInput)).toHaveValue(fixture.Second)
  await expect(page).toHaveURL(original)
})
