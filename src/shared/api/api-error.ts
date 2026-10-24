import { HttpStatus } from "./http-status"

export class ApiError extends Error {
  readonly code?: string

  constructor(
    readonly status: number,
    message: string,
    options?: ErrorOptions & { code?: string },
  ) {
    super(message, options)
    this.name = "ApiError"
    this.code = options?.code
  }

  get isConflict(): boolean {
    return this.status === HttpStatus.Conflict
  }
}
