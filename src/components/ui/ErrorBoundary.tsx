'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// Error Boundary Props & State
// ═══════════════════════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// Error Boundary Component
// Catches JavaScript errors anywhere in child component tree
// ═══════════════════════════════════════════════════════════════════════════════

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

    this.setState({ errorInfo })

    // Here you could send to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Oops! Something went wrong
            </h1>

            {/* User-friendly message */}
            <p className="text-slate-600 mb-6">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified.
              Please try refreshing the page or go back to the homepage.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </button>
            </div>

            {/* Error Details (for debugging) */}
            <div className="text-left">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition mx-auto"
              >
                {this.state.showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide technical details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show technical details
                  </>
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-4 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-60">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Error:</p>
                  <pre className="text-xs text-red-600 font-mono whitespace-pre-wrap break-all">
                    {this.state.error?.toString()}
                  </pre>

                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p className="text-xs font-semibold text-slate-600 mt-4 mb-2">Component Stack:</p>
                      <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap break-all">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
