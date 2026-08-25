'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log structured error internally
    console.error('Dashboard Error Boundary caught error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-marble-50 py-12">
      <div className="bg-white rounded-sm shadow-sm border border-walnut-100 max-w-md w-full overflow-hidden">
        <div className="brass-inlay" />
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-walnut-100 flex items-center justify-center mx-auto mb-4 text-walnut-700 font-display">
            🌿
          </div>
          <h2 className="text-lg font-display font-medium text-walnut-800 mb-2">
            Something unexpected occurred
          </h2>
          <p className="text-xs text-walnut-500 mb-6 leading-relaxed">
            We encountered a temporary error while processing this request. Your data is safe and has not been affected.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs font-medium text-white bg-walnut-800 hover:bg-walnut-700 px-5 py-2.5 rounded-sm focus-ring transition-colors"
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              className="text-xs font-medium text-walnut-700 bg-walnut-100 hover:bg-walnut-200 px-5 py-2.5 rounded-sm focus-ring transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
