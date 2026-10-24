const surfaces = ["application", "storybook"]

export async function restoreRelease(state, { platform, persist }) {
  if (state.status === "complete") return
  const failures = []

  for (const surface of [...state.attempted].reverse()) {
    try {
      await platform.rollback(surface, state.previous[surface].id)
      state.attempted = state.attempted.filter((entry) => entry !== surface)
      await persist(state)
    } catch (error) {
      failures.push(error)
    }
  }

  if (failures.length) throw new AggregateError(failures, "Production rollback failed; durable recovery state retained")
}

export async function release({ platform, verify, persist }) {
  const state = { status: "preparing", previous: {}, candidates: {}, attempted: [] }

  for (const surface of surfaces) state.previous[surface] = await platform.previous(surface)
  await persist(state)

  try {
    for (const surface of surfaces) {
      state.candidates[surface] = { ...(await platform.publish(surface)), productionUrl: state.previous[surface].productionUrl }
    }

    await persist(state)
    await verify(state.candidates, "candidates")
    state.status = "promoting"

    for (const surface of surfaces) {
      // Record intent before the command: a failed response may follow a successful domain change.
      state.attempted.push(surface)
      await persist(state)
      await platform.promote(surface, state.candidates[surface].id)
    }

    await verify(state.candidates, "production")
    state.status = "complete"
    await persist(state)

    return state.candidates
  } catch (error) {
    try {
      await restoreRelease(state, { platform, persist })
    } catch (rollbackError) {
      throw new AggregateError([error, rollbackError], "Release failed and production rollback needs attention")
    }

    throw error
  }
}
