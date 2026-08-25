export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-marble-50 animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-white border-b border-walnut-100 px-8 flex items-center justify-between">
        <div className="h-4 w-36 bg-walnut-100 rounded-sm" />
        <div className="h-4 w-24 bg-walnut-100 rounded-sm" />
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-walnut-200 rounded-sm" />
          <div className="h-9 w-32 bg-walnut-200 rounded-sm" />
        </div>

        <div className="h-14 bg-white rounded-sm border border-walnut-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-56 bg-white rounded-sm border border-walnut-100 p-6 space-y-4">
              <div className="h-5 w-3/4 bg-walnut-100 rounded-sm" />
              <div className="h-4 w-1/2 bg-walnut-100 rounded-sm" />
              <div className="h-12 bg-walnut-50 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
