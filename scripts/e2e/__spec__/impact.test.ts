import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createE2ePlan } from "../impact.mjs"
import { changedHelper, changedValue, createFixture, firstSpec, helperFile, secondSpec, sourceFile } from "./planner.fixtures"

describe("E2E impact planning", () => {
  let fixture: ReturnType<typeof createFixture>

  beforeEach(() => {
    fixture = createFixture()
  })

  afterEach(() => fixture.cleanup())

  it.each(["README.md", "docs/design.markdown", "src/features/booking/__spec__/value.test.ts", "vitest.config.ts"])(
    "skips browser execution for unit/docs-only change %s",
    async (file) => {
      fixture.write(file, "// changed\n")
      const plan = await createE2ePlan(fixture)

      expect(plan).toMatchObject({ version: 1, mode: "none", files: [] })
    },
  )

  it.each([firstSpec, helperFile, sourceFile])("selects dependent specs for %s", async (file) => {
    fixture.write(file, file === helperFile ? changedHelper : changedValue)

    if (file === firstSpec) {
      fixture.write(
        file,
        `import { test } from ${JSON.stringify(import.meta.resolve("@playwright/test"))}\n` + "test('changed booking', () => {})\n",
      )
    }

    const plan = await createE2ePlan(fixture)

    expect(plan).toMatchObject({ version: 1, mode: "selected", files: [firstSpec] })
  })

  it("deduplicates and sorts selected spec files", async () => {
    fixture.write(
      secondSpec,
      `import { test } from ${JSON.stringify(import.meta.resolve("@playwright/test"))}\n` + "test('changed rooms', () => {})\n",
    )

    fixture.write(helperFile, changedHelper)
    const plan = await createE2ePlan(fixture)

    expect(plan.files).toEqual([firstSpec, secondSpec])
  })

  it.each([
    "src/_app/styles/globals.css",
    "app/page.tsx",
    ".storybook/preview.ts",
    "public/example.md",
    "src/shared/lib/clock.ts",
    "src/shared/i18n/resources.ts",
    "src/shared/config/constants.ts",
    "src/features/booking/test-ids.ts",
    "package.json",
    "scripts/validation/runtime.mjs",
    "unknown/file.ts",
  ])("falls back to all specs for global or uncertain input %s", async (file) => {
    fixture.write(file, "changed\n")
    const plan = await createE2ePlan(fixture)

    expect(plan).toMatchObject({ mode: "all", files: [] })
  })

  it("runs all specs when changed production code has no static test dependency", async () => {
    fixture.write("src/features/unlinked/model/value.ts", changedValue)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "all", files: [] })
  })

  it("does not hide an unlinked runtime change behind a linked change", async () => {
    fixture.write(sourceFile, changedValue)
    fixture.write("src/features/unlinked/model/value.ts", changedValue)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "all", files: [] })
  })

  it("does not mistake a changed spec for coverage of an unlinked runtime module", async () => {
    fixture.write(helperFile, changedHelper)
    fixture.write("src/features/unlinked/model/value.ts", changedValue)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "all", files: [] })
  })

  it("includes committed changes since the supplied base", async () => {
    fixture.write(helperFile, changedHelper)
    fixture.git("add", helperFile)
    fixture.git("-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", "helper fixture")

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "selected", files: [firstSpec] })
  })

  it("selects a renamed browser spec at its current path", async () => {
    const renamedSpec = "tests/e2e/renamed.spec.ts"

    fixture.git("mv", firstSpec, renamedSpec)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "selected", files: [renamedSpec] })
  })

  it("falls back to all for a deleted unlinked production module", async () => {
    const deletedFile = "src/features/unlinked/model/value.ts"

    fixture.write(deletedFile, changedValue)
    fixture.git("add", deletedFile)
    fixture.git("-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", "unlinked fixture")
    const base = fixture.git("rev-parse", "HEAD")

    fixture.git("rm", deletedFile)

    expect(await createE2ePlan({ root: fixture.root, base })).toMatchObject({ mode: "all", files: [] })
  })

  it("skips an unreferenced browser helper", async () => {
    fixture.write("tests/e2e/helpers/unlinked.ts", changedValue)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "none", files: [] })
  })

  it("accounts for deleted specs without selecting missing files", async () => {
    fixture.git("rm", firstSpec)

    expect(await createE2ePlan(fixture)).toMatchObject({ mode: "none", files: [] })
  })

  it.each([undefined, "", "--help", "HEAD;echo invalid", "0".repeat(40)])("uses all specs for unavailable base %s", async (base) => {
    expect(await createE2ePlan({ root: fixture.root, base })).toMatchObject({ mode: "all", files: [] })
  })
})
