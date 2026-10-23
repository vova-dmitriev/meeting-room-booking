export const Tone = { Neutral: "neutral", Success: "success", Warning: "warning", Danger: "danger" } as const

export type Tone = (typeof Tone)[keyof typeof Tone]

export const ButtonVariant = { Primary: "primary", Secondary: "secondary", Ghost: "ghost", Danger: "danger" } as const

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant]

export const Theme = { Light: "light", Dark: "dark" } as const

export type Theme = (typeof Theme)[keyof typeof Theme]

export const PreviewState = {
  Default: "default",
  Empty: "empty",
  Loading: "loading",
  Error: "error",
  Conflict: "conflict",
  Sending: "sending",
  Invalid: "invalid",
} as const

export type PreviewState = (typeof PreviewState)[keyof typeof PreviewState]
