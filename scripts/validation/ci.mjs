import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { validationCommands } from "./commands.mjs"
import { cancellation } from "./cancellation.mjs"
import { executeCommand } from "./runner.mjs"
import { cleanEnvironment } from "./snapshot.mjs"

const aliases = {
  unit: "unit and integration tests",
  storybook: "Storybook mobile, tablet and desktop",
  "build-application": "production build",
  "build-storybook": "Storybook build",
  e2e: "Playwright E2E",
}

export function ciCommand(id) {
  const name = Object.hasOwn(aliases, id) ? aliases[id] : id
  const command = validationCommands.find((step) => step.name === name)

  if (!command) throw new Error(`Unknown CI validation command: ${id}`)

  return command
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const control = cancellation()

  try {
    const command = ciCommand(process.argv[2])

    const environment = {
      ...cleanEnvironment(),
      CI: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      STORYBOOK_DISABLE_TELEMETRY: "1",
      RAYON_NUM_THREADS: "1",
      UV_THREADPOOL_SIZE: "1",
      OMP_NUM_THREADS: "1",
    }

    process.stdout.write(`CI validation: ${command.name}\n`)

    const status = await executeCommand(command, process.cwd(), environment, { signal: control.signal })

    if (status !== 0) throw new Error(`CI validation failed: ${command.name} (exit ${status})`)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  } finally {
    control.dispose()
  }
}
