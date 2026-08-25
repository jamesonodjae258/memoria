'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-marble-50 min-h-screen flex items-center justify-center font-sans p-4">
        <div className="bg-white rounded-sm shadow-sm border border-walnut-200 p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-medium text-walnut-900 mb-2">
            System Notice
          </h2>
          <p className="text-sm text-walnut-600 mb-6 leading-relaxed">
            The application experienced a critical issue. Please try refreshing or return to the main dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-walnut-800 text-white text-xs font-medium px-4 py-2 rounded-sm"
            >
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
