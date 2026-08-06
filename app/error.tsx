'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details
    console.error('Global error:', error);

    // Track error event
    trackEvent({
      event: 'form_submit_error',
      label: 'global_error',
      value: error.message,
    });

    // TODO: Send to error tracking service
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07080b] to-[#11141d] flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong!</h1>
        <p className="text-white/60 mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
        >
          Try Again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left bg-red-900/20 p-4 rounded text-xs text-red-400">
            <summary className="cursor-pointer font-mono">Error details</summary>
            <pre className="mt-2 overflow-auto">{error.message}</pre>
            {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
          </details>
        )}
      </div>
    </main>
  );
}
