"use client"

import { Component } from "react"
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./error-boundary.types"
import { ErrorFallback } from "./error-fallback"

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled render error", error)
  }

  private retry = () => {
    this.setState({ failed: false })
  }

  render() {
    return this.state.failed ? <ErrorFallback onRetry={this.retry} /> : this.props.children
  }
}
