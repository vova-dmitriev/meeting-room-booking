import { describe, expect, it } from "vitest"
import { release, restoreRelease } from "../release.mjs"

function fixture(failure = "") {
  const events: string[] = []
  let state: Record<string, unknown> = {}

  const platform = {
    previous: async (surface: string) => {
      events.push(`previous:${surface}`)

      return { id: `dpl_previous_${surface}`, productionUrl: `https://${surface}.vercel.app` }
    },
    publish: async (surface: string) => {
      events.push(`publish:${surface}`)
      if (failure === `publish:${surface}`) throw new Error(failure)

      return { id: `dpl_${surface}`, url: `https://${surface}-candidate.vercel.app`, productionUrl: `https://${surface}.vercel.app` }
    },
    promote: async (surface: string) => {
      events.push(`promote:${surface}`)
      if (failure === `promote:${surface}`) throw new Error(failure)
    },
    rollback: async (surface: string, id: string) => {
      events.push(`rollback:${surface}:${id}`)
      if (failure.includes("rollback") && surface === "storybook") throw new Error("rollback denied")
    },
  }

  const verify = async (_candidates: unknown, stage: string) => {
    events.push(`verify:${stage}`)
    if (failure.includes(`verify:${stage}`)) throw new Error(failure)
  }

  const persist = async (next: Record<string, unknown>) => {
    state = structuredClone(next)
  }

  return { platform, verify, persist, events, state: () => state }
}

describe("verified production release", () => {
  it("verifies both immutable candidates before promotion, then verifies production", async () => {
    const test = fixture()

    await release(test)

    expect(test.events).toEqual([
      "previous:application",
      "previous:storybook",
      "publish:application",
      "publish:storybook",
      "verify:candidates",
      "promote:application",
      "promote:storybook",
      "verify:production",
    ])

    expect(test.state().status).toBe("complete")
  })

  it.each(["publish:storybook", "verify:candidates"])("leaves live sites untouched when %s fails", async (failure) => {
    const test = fixture(failure)

    await expect(release(test)).rejects.toThrow(failure)
    expect(test.events.some((event) => event.startsWith("promote:") || event.startsWith("rollback:"))).toBe(false)
  })

  it.each(["promote:storybook", "verify:production"])("restores both previous deployments after %s", async (failure) => {
    const test = fixture(failure)

    await expect(release(test)).rejects.toThrow(failure)
    expect(test.events.slice(-2)).toEqual(["rollback:storybook:dpl_previous_storybook", "rollback:application:dpl_previous_application"])
    expect(test.state().attempted).toEqual([])
  })

  it("tries the other rollback when one rollback fails and retains recovery state", async () => {
    const test = fixture("verify:production rollback")

    await expect(release(test)).rejects.toThrow(/rollback/i)
    expect(test.events.at(-1)).toBe("rollback:application:dpl_previous_application")
    expect(test.state().attempted).toEqual(["storybook"])
  })

  it("can recover a durable transaction interrupted during promotion", async () => {
    const test = fixture()

    await restoreRelease(
      {
        status: "promoting",
        attempted: ["application"],
        previous: { application: { id: "dpl_previous_application" } },
      },
      test,
    )

    expect(test.events).toEqual(["rollback:application:dpl_previous_application"])
  })

  it("does not undo an already verified release during cleanup", async () => {
    const test = fixture()

    await restoreRelease({ status: "complete", attempted: ["application"] }, test)
    expect(test.events).toEqual([])
  })
})
