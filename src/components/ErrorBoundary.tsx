import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  copied: boolean
}

// Reusable icon components
const AlertIcon = () => (
  <svg
    className="w-8 h-8 sm:w-10 sm:h-10 text-destructive"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
)

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
)

const CopyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

// Utility function to format error details
const formatErrorDetails = (error: Error, errorInfo: ErrorInfo | null): string => {
  return `Error: ${error.message}

Stack Trace:
${error.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}

Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}`
}

/**
 * Error Boundary Component
 * 
 * Catches React errors in the component tree and displays a fallback UI
 * instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<Props, State> {
  private copyTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
    // TODO: Send error to error reporting service (e.g., Sentry)
  }

  componentWillUnmount() {
    if (this.copyTimeoutId) {
      clearTimeout(this.copyTimeoutId)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    })
  }

  private handleCopyError = async () => {
    const { error, errorInfo } = this.state
    if (!error) return

    try {
      const errorText = formatErrorDetails(error, errorInfo)
      await navigator.clipboard.writeText(errorText)
      this.setState({ copied: true })
      
      this.copyTimeoutId = setTimeout(() => {
        this.setState({ copied: false })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleGoToDashboard = () => {
    this.handleReset()
    window.location.href = '/dashboard'
  }

  private renderErrorIcon() {
    return (
      <div className="flex justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertIcon />
        </div>
      </div>
    )
  }

  private renderErrorTitle() {
    return (
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          An unexpected error occurred. We apologize for the inconvenience.
        </p>
      </div>
    )
  }

  private renderErrorDetails() {
    const { error, copied } = this.state

    if (!import.meta.env.DEV || !error) {
      return null
    }

    return (
      <div className="text-sm text-left bg-destructive/10 p-3 sm:p-4 rounded-lg border border-destructive/20">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="font-semibold text-destructive break-words flex-1">
            {error.message}
          </p>
          <button
            onClick={this.handleCopyError}
            className="flex-shrink-0 p-1.5 hover:bg-destructive/20 rounded transition-colors"
            title="Copy error details"
            aria-label="Copy error details"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
        {error.stack && (
          <pre className="mt-2 text-xs overflow-x-auto max-h-32 sm:max-h-40 whitespace-pre-wrap break-words">
            {error.stack}
          </pre>
        )}
      </div>
    )
  }

  private renderActionButtons() {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2">
        <button
          onClick={this.handleRefresh}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Refresh Page
        </button>
        <button
          onClick={this.handleGoToDashboard}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  private renderCopyConfirmation() {
    if (!this.state.copied) {
      return null
    }

    return (
      <p className="text-xs sm:text-sm text-green-600 animate-in fade-in duration-200">
        ✓ Error details copied to clipboard
      </p>
    )
  }

  private renderFallbackUI() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
        <div className="text-center max-w-md w-full space-y-4 sm:space-y-6">
          {this.renderErrorIcon()}
          {this.renderErrorTitle()}
          {this.renderErrorDetails()}
          {this.renderActionButtons()}
          {this.renderCopyConfirmation()}
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderFallbackUI()
    }

    return this.props.children
  }
}
