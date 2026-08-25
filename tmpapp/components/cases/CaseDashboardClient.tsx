'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardShell from '@/components/layout/DashboardShell'
import MetricCard from '@/components/dashboard/MetricCard'
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts'
import CaseTable from '@/components/dashboard/CaseTable'
import type { CaseRecord, Document } from '@/types'

interface CaseDashboardClientProps {
  cases: CaseRecord[]
  documentsMap: Record<string, Document[]>
  funeralHomeName: string
  staffName: string
  isSuperAdmin?: boolean
}

export default function CaseDashboardClient({
  cases,
  documentsMap,
  funeralHomeName,
  staffName,
  isSuperAdmin = false,
}: CaseDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Compute metrics
  const totalCases = cases.length
  const activeCount = cases.filter((c) => c.status !== 'completed').length
  const pendingReviewCount = cases.filter(
    (c) => c.status === 'documents_pending' || c.status === 'family_review'
  ).length
  const completedCount = cases.filter((c) => c.status === 'completed').length
  const scheduledCount = cases.filter(
    (c) => Boolean(c.service_date) && c.status !== 'completed'
  ).length

  // Calculate compliance ready rate
  const complianceReadyPercent =
    totalCases > 0
      ? Math.round(((totalCases - pendingReviewCount) / totalCases) * 100)
      : 100

  return (
    <DashboardShell
      funeralHomeName={funeralHomeName}
      staffName={staffName}
      isSuperAdmin={isSuperAdmin}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {/* 1. Page Title Header & Global Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DC]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white text-[#8C7E6E] text-[11px] font-semibold uppercase tracking-wider mb-2 border border-[#E5E2DC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8935D]" />
            Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#2C221E] tracking-tight">
            Active Cases &amp; Operations Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E50] mt-1">
            Real-time management for decedent intakes, compliance filings, and memorial arrangements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/dashboard/compliance"
            className="btn-secondary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-10 flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>Compliance Library</span>
          </Link>

          <Link
            href="/dashboard/cases/new"
            className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2.5 h-10 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Record New Intake</span>
          </Link>
        </div>
      </div>

      {/* 2. Operational Focus Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Active Intakes"
          subtitle="Cases currently in active coordination"
          value={activeCount}
          badgeText="Active"
          badgeColor="bg-[#EDF3EC] text-[#346538]"
          progressPercent={85}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        <MetricCard
          title="Pending Documents"
          subtitle="Awaiting state filings or certificates"
          value={pendingReviewCount}
          badgeText="Requires Action"
          badgeColor="bg-[#FBF3DB] text-[#956400]"
          progressPercent={pendingReviewCount > 0 ? 45 : 100}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Upcoming Services"
          subtitle="Memorials scheduled next 7 days"
          value={scheduledCount}
          badgeText="Scheduled"
          badgeColor="bg-[#F2EFEA] text-[#2C221E]"
          progressPercent={scheduledCount > 0 ? 70 : 0}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <MetricCard
          title="Compliance Ready Rate"
          subtitle="Overall portfolio compliance index"
          value={`${complianceReadyPercent}%`}
          badgeText="Healthy"
          badgeColor="bg-[#EDF3EC] text-[#346538]"
          progressPercent={complianceReadyPercent}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* 3. Analytics Charts */}
      <AnalyticsCharts
        totalCases={totalCases}
        activeCount={activeCount}
        completedCount={completedCount}
      />

      {/* 4. High-Density TanStack Case Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#2C221E]">
            All Cases Ledger
          </h2>
          <span className="text-xs text-[#8C7E6E]">
            Showing {cases.length} records • Real-time synchronization
          </span>
        </div>

        <CaseTable
          cases={cases}
          documentsMap={documentsMap}
          searchQuery={searchQuery}
        />
      </div>
    </DashboardShell>
  )
}
