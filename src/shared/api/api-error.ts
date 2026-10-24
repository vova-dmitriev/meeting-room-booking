import { HttpStatus } from "./http-status"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "ApiError"
  }

  get isConflict(): boolean {
    return this.status === HttpStatus.Conflict
  }
}
