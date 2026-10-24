import { describe, expect, it } from "vitest"
import { assertPipelinePassed, executeCommand, runPipeline } from "../runner.mjs"

function latch() {
  let release: () => void = () => undefined

  const promise = new Promise<void>((resolve) => {
    release = resolve
  })

  return { promise, release }
}

describe("bounded validation graph", () => {
  it("starts independent checks concurrently while respecting the global cap", async () => {
    const first = latch()
    const second = latch()
    const started: string[] = []
    let active = 0
    let peak = 0

    const running = runPipeline(
      [{ name: "first" }, { name: "second" }, { name: "third" }],
      async (step: { name: string }) => {
        started.push(step.name)
        active += 1
        peak = Math.max(peak, active)
        await (step.name === "first" ? first.promise : second.promise)
        active -= 1

        return 0
      },
      { limit: 2 },
    )

    await Promise.resolve()
    expect(started).toEqual(["first", "second"])
    first.release()
    second.release()
    expect((await running).map((result: { status: number }) => result.status)).toEqual([0, 0, 0])
    expect(peak).toBe(2)
  })

  it("waits for prerequisites and blocks dependants after failure", async () => {
    const started: string[] = []

    const results = await runPipeline(
      [{ name: "install" }, { name: "typegen", needs: ["install"] }, { name: "build", needs: ["typegen"] }, { name: "unrelated" }],
      async (step: { name: string }) => {
        started.push(step.name)

        return step.name === "typegen" ? 3 : 0
      },
      { limit: 2 },
    )

    expect(started.indexOf("typegen")).toBeGreaterThan(started.indexOf("install"))
    expect(started).not.toContain("build")
    expect(results).toContainEqual(expect.objectContaining({ name: "build", status: null, blocked: true }))
    expect(() => assertPipelinePassed(results)).toThrow("typegen")
  })

  it("preserves an early real command failure after a later successful command", async () => {
    const commands = [
      { name: "fails", executable: process.execPath, args: ["-e", "process.exit(7)"] },
      { name: "passes", executable: process.execPath, args: ["-e", "process.exit(0)"] },
    ]

    const results = await runPipeline(commands, (step: (typeof commands)[number]) => executeCommand(step, process.cwd(), process.env), {
      limit: 1,
    })

    expect(results.map((result: { status: number }) => result.status)).toEqual([7, 0])
    expect(() => assertPipelinePassed(results)).toThrow("fails (exit 7)")
  })

  it("blocks a timed out process and a missing executable", async () => {
    const timedOut = await executeCommand(
      { name: "hangs", executable: process.execPath, args: ["-e", "setInterval(() => {}, 1000)"] },
      process.cwd(),
      process.env,
      { timeoutMs: 100 },
    )

    const missing = await executeCommand(
      { name: "missing", executable: "missing-validation-executable", args: [] },
      process.cwd(),
      process.env,
    )

    expect(timedOut).not.toBe(0)
    expect(missing).not.toBe(0)
  })

  it("rejects missing prerequisites and dependency cycles", async () => {
    await expect(runPipeline([{ name: "invalid", needs: ["missing"] }], async () => 0)).rejects.toThrow("Unknown prerequisite")

    await expect(
      runPipeline(
        [
          { name: "first", needs: ["second"] },
          { name: "second", needs: ["first"] },
        ],
        async () => 0,
      ),
    ).rejects.toThrow("cycle")
  })

  it("collects blocked results even when dependants precede their failed prerequisites", async () => {
    const results = await runPipeline(
      [{ name: "dependent", needs: ["middle"] }, { name: "middle", needs: ["fails"] }, { name: "fails" }],
      async () => 9,
    )

    expect(results.map((result: { status: number | null }) => result.status)).toEqual([null, null, 9])
  })

  it("cancels a running command without reporting success", async () => {
    const controller = new AbortController()

    const running = executeCommand(
      { name: "cancelled", executable: process.execPath, args: ["-e", "setInterval(() => {}, 1000)"] },
      process.cwd(),
      process.env,
      { signal: controller.signal },
    )

    controller.abort()
    expect(await running).toBe(130)
  })
})
