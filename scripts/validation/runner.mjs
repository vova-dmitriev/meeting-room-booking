import { spawn } from "node:child_process"

export async function runPipeline(steps, execute, { limit = 2 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 4) {
    throw new Error("Validation concurrency must be an integer from 1 to 4")
  }

  const pending = new Map(steps.map((step) => [step.name, step]))
  const results = new Map()
  const running = new Map()

  if (pending.size !== steps.length) {
    throw new Error("Validation step names must be unique")
  }

  for (const step of steps) {
    for (const dependency of step.needs ?? []) {
      if (!pending.has(dependency)) {
        throw new Error(`Unknown prerequisite ${dependency}`)
      }
    }
  }

  while (pending.size > 0 || running.size > 0) {
    let progressed = false

    for (const [name, step] of pending) {
      const dependencies = (step.needs ?? []).map((dependency) => results.get(dependency))

      if (dependencies.some((result) => result && result.status !== 0)) {
        results.set(name, { name, status: null, blocked: true })
        pending.delete(name)
        progressed = true

        continue
      }

      if (running.size >= limit || dependencies.some((result) => !result)) {
        continue
      }

      pending.delete(name)
      progressed = true

      const completion = Promise.resolve()
        .then(() => execute(step))
        .then((status) => results.set(name, { name, status }))
        .catch(() => results.set(name, { name, status: 1 }))
        .finally(() => running.delete(name))

      running.set(name, completion)
    }

    if (running.size > 0) {
      await Promise.race(running.values())
    } else if (pending.size > 0 && !progressed) {
      throw new Error("Validation dependency cycle prevents required checks from running")
    }
  }

  return steps.map((step) => results.get(step.name))
}

export function assertPipelinePassed(results) {
  const failed = results.filter((result) => result.status !== 0)

  if (failed.length > 0) {
    const summary = failed.map((result) => `${result.name} (${result.blocked ? "blocked prerequisite" : `exit ${result.status}`})`)

    throw new Error(`Validation blocked: ${summary.join(", ")}`)
  }
}

export function executeCommand(step, cwd, environment, { timeoutMs = 1200000, signal = new AbortController().signal } = {}) {
  if (signal?.aborted) {
    return Promise.resolve(130)
  }

  return new Promise((resolve) => {
    const child = spawn(step.executable, step.args, {
      cwd,
      env: environment,
      stdio: "inherit",
      detached: process.platform !== "win32",
    })

    let timedOut = false
    let stopped = false
    let forceKill

    function stop(termination = "SIGTERM") {
      if (!child.pid) {
        return
      }

      try {
        if (process.platform === "win32") {
          child.kill(termination)
        } else {
          process.kill(-child.pid, termination)
        }
      } catch {
        // An exited process group needs no further cleanup.
      }
    }

    const abort = () => {
      stop()
      forceKill = setTimeout(() => stop("SIGKILL"), 2000)
      forceKill.unref()
    }

    const timeout = setTimeout(() => {
      timedOut = true
      abort()
    }, timeoutMs)

    timeout.unref()
    signal?.addEventListener("abort", abort, { once: true })

    function finish(status) {
      if (stopped) {
        return
      }

      stopped = true
      clearTimeout(timeout)
      clearTimeout(forceKill)
      signal?.removeEventListener("abort", abort)
      stop("SIGKILL")
      resolve(timedOut ? 124 : signal?.aborted ? 130 : status)
    }

    child.once("error", () => finish(127))
    child.once("close", (code) => finish(code ?? 1))
  })
}
