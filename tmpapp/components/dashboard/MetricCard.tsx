'use client'

import React from 'react'

interface MetricCardProps {
  title: string
  subtitle: string
  value: string | number
  progressPercent?: number
  badgeText: string
  badgeColor?: string
  icon?: React.ReactNode
}

export default function MetricCard({
  title,
  subtitle,
  value,
  progressPercent,
  badgeText,
  badgeColor = 'bg-[#F2EFEA] text-[#2C221E]',
  icon,
}: MetricCardProps) {
  return (
    <div className="card-premium p-5 flex flex-col justify-between space-y-4 hover:border-[#A8935D]/60 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6E]">
            {title}
          </span>
          {icon && <div className="text-[#A8935D]">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-2.5 mt-2">
          <span className="text-2xl font-display font-bold text-[#2C221E]">
            {value}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-mono ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        <p className="text-xs text-[#6B5E50] mt-1 line-clamp-1">
          {subtitle}
        </p>
      </div>

      {progressPercent !== undefined && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-[#8C7E6E] font-semibold">
            <span>OPERATIONAL READINESS</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F2EFEA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A8935D] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
