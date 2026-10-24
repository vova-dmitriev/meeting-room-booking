export const BootstrapPhase = { Loading: "loading", Ready: "ready", Error: "error" } as const

export type BootstrapPhase = (typeof BootstrapPhase)[keyof typeof BootstrapPhase]
