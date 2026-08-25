export default function CaseDetailLoading() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 w-48 bg-walnut-200 rounded-sm" />
      <div className="h-8 w-64 bg-walnut-200 rounded-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-white rounded-sm border border-walnut-100 p-6 space-y-4">
          <div className="h-4 w-32 bg-walnut-100 rounded-sm" />
          <div className="h-4 w-full bg-walnut-100 rounded-sm" />
          <div className="h-4 w-2/3 bg-walnut-100 rounded-sm" />
        </div>

        <div className="h-64 bg-white rounded-sm border border-walnut-100 p-6 space-y-4">
          <div className="h-4 w-32 bg-walnut-100 rounded-sm" />
          <div className="h-4 w-full bg-walnut-100 rounded-sm" />
          <div className="h-4 w-2/3 bg-walnut-100 rounded-sm" />
        </div>
      </div>
    </div>
  )
}
