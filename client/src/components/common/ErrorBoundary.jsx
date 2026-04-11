import { Component } from 'react'

// ─────────────────────────────────────────────────────────────
// ERROR FALLBACK UI
// ─────────────────────────────────────────────────────────────
function ErrorFallback({ error, onReset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-3xl">
        ⚠️
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. Your data is safe — try refreshing or going back to the home page.
      </p>
      {error?.message && (
        <p className="mt-3 rounded-lg bg-secondary px-4 py-2 font-mono text-xs text-muted-foreground">
          {error.message}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onReset}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          Go home
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// Class component required — React has no hook equivalent yet.
// Wrap around any subtree to catch rendering crashes.
// ─────────────────────────────────────────────────────────────
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Replace with a proper logger (Sentry, Datadog, etc.) when available
    console.error('[ErrorBoundary] Caught:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}
