/**
 * Error Boundary for catching React errors
 * Logs errors and displays fallback UI
 */

'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Track error event for analytics
    trackEvent({
      event: 'form_submit_error',
      label: 'error_boundary',
      value: error.message,
    });

    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-[#07080b]">
            <div className="max-w-md p-8 text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-white/60 mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left bg-red-900/20 p-4 rounded text-xs text-red-400">
                  <summary className="cursor-pointer font-mono">Error details</summary>
                  <pre className="mt-2 overflow-auto">{this.state.error.toString()}</pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
