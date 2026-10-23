import { availableParallelism } from "node:os"
import { validationCommands } from "./commands.mjs"
import { cancellation } from "./cancellation.mjs"
import { assertPipelinePassed, executeCommand, runPipeline } from "./runner.mjs"
import { cleanEnvironment } from "./snapshot.mjs"

const control = cancellation()

try {
  const requested = Number(process.env.VALIDATION_CONCURRENCY ?? 2)

  if (!Number.isInteger(requested) || requested < 1 || requested > 4) {
    throw new Error("VALIDATION_CONCURRENCY must be an integer from 1 to 4")
  }

  const limit = Math.min(requested, availableParallelism())

  const environment = {
    ...cleanEnvironment(),
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    STORYBOOK_DISABLE_TELEMETRY: "1",
    VALIDATION_TEST_WORKERS: "1",
    RAYON_NUM_THREADS: "1",
    UV_THREADPOOL_SIZE: "1",
    OMP_NUM_THREADS: "1",
  }

  process.stdout.write(`Validation: at most ${limit} independent checks; one test/build worker per branch.\n`)

  const results = await runPipeline(
    validationCommands,
    async (step) => {
      process.stdout.write(`\nValidation started: ${step.name}\n`)

      const status = await executeCommand(step, process.cwd(), environment, { signal: control.signal })

      process.stdout.write(`\nValidation finished: ${step.name} (exit ${status})\n`)

      return status
    },
    { limit },
  )

  for (const result of results) {
    process.stdout.write(`Validation result: ${result.name}: ${result.blocked ? "blocked" : result.status}\n`)
  }

  assertPipelinePassed(results)
} catch (error) {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
} finally {
  control.dispose()
}
