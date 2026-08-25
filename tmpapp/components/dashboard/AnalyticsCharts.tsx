'use client'

import { useState } from 'react'

interface AnalyticsChartsProps {
  totalCases: number
  activeCount: number
  completedCount: number
}

export default function AnalyticsCharts({
  totalCases,
  activeCount,
  completedCount,
}: AnalyticsChartsProps) {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '12m'>('30d')

  // Sample monthly trend data
  const trendData = [
    { month: 'Apr', burials: 8, cremations: 12 },
    { month: 'May', burials: 11, cremations: 14 },
    { month: 'Jun', burials: 9, cremations: 16 },
    { month: 'Jul', burials: 14, cremations: 18 },
    { month: 'Aug', burials: 12, cremations: 19 },
    { month: 'Sep', burials: 15, cremations: 22 },
  ]

  // Service distribution data
  const servicesData = [
    { name: 'Traditional Burial', count: 18, color: 'bg-[#2C221E]', pct: 36 },
    { name: 'Direct Cremation', count: 22, color: 'bg-[#A8935D]', pct: 44 },
    { name: 'Memorial Chapel', count: 7, color: 'bg-[#8C7E6E]', pct: 14 },
    { name: 'Transit / Transfer', count: 3, color: 'bg-[#D4C596]', pct: 6 },
  ]

  const maxVal = 25
  const chartHeight = 120

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Case Inflow & Volume Trend (2 Columns) */}
      <div className="card-premium p-5 lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-semibold text-[#2C221E]">
              Monthly Intake Volume &amp; Disposition Trends
            </h2>
            <p className="text-[11px] text-[#6B5E50]">
              Comparative breakdown between burial and cremation arrangements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8C7E6E]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2C221E]" />
                Burial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
                Cremation
              </span>
            </div>

            <div className="flex items-center p-0.5 bg-[#F2EFEA] rounded border border-[#E5E2DC] text-[10px] font-bold">
              {(['30d', '90d', '12m'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    timeframe === t
                      ? 'bg-white text-[#2C221E] shadow-2xs font-bold'
                      : 'text-[#8C7E6E] hover:text-[#2C221E]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Line / Area Graph */}
        <div className="pt-2">
          <div className="h-32 w-full flex items-end justify-between gap-4 px-2 relative border-b border-[#E5E2DC]">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-dashed border-[#8C7E6E]" />
              <div className="border-b border-dashed border-[#8C7E6E]" />
              <div className="border-b border-dashed border-[#8C7E6E]" />
            </div>

            {trendData.map((d, idx) => {
              const burialHeight = (d.burials / maxVal) * chartHeight
              const cremationHeight = (d.cremations / maxVal) * chartHeight

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1310] text-[#FAF9F7] text-[9px] font-mono px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-md z-20">
                    Burial: {d.burials} • Cremation: {d.cremations}
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-28">
                    <div
                      className="w-2.5 sm:w-3.5 bg-[#2C221E] rounded-t-xs transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${burialHeight}px` }}
                    />
                    <div
                      className="w-2.5 sm:w-3.5 bg-[#A8935D] rounded-t-xs transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${cremationHeight}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[#8C7E6E] mt-1">
                    {d.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. Service Distribution Breakdown (1 Column) */}
      <div className="card-premium p-5 space-y-4">
        <div>
          <h2 className="font-display text-sm font-semibold text-[#2C221E]">
            Arrangement Distribution
          </h2>
          <p className="text-[11px] text-[#6B5E50]">
            Active portfolio by service category.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {servicesData.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#2C221E] flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.name}
                </span>
                <span className="text-[#8C7E6E] font-mono text-[11px]">
                  {s.count} ({s.pct}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F2EFEA] rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.color} rounded-full`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#E5E2DC] flex items-center justify-between text-[11px] text-[#8C7E6E]">
          <span>Total Cases Tracked</span>
          <span className="font-bold font-mono text-[#2C221E]">{totalCases || 50} Cases</span>
        </div>
      </div>
    </div>
  )
}
