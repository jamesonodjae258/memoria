'use client'

import { useState } from 'react'
import Link from 'next/link'
import CaseCard from './CaseCard'
import type { CaseRecord, Document } from '@/types'

import DashboardHeader from '@/components/dashboard/DashboardHeader'

export type FilterTab = 'all' | 'active' | 'pending_review' | 'completed'

interface CaseDashboardClientProps {
  cases: CaseRecord[]
  documentsMap: Record<string, Document[]>
  funeralHomeName: string
  staffName: string
}

export default function CaseDashboardClient({
  cases,
  documentsMap,
  funeralHomeName,
  staffName,
}: CaseDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  // Filter cases based on search and tab selection
  const filteredCases = cases.filter((c) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      c.deceased_name.toLowerCase().includes(query) ||
      c.family_contact_name.toLowerCase().includes(query) ||
      (c.service_location && c.service_location.toLowerCase().includes(query))

    if (!matchesSearch) return false

    if (activeTab === 'all') return true
    if (activeTab === 'active') {
      return c.status !== 'completed'
    }
    if (activeTab === 'pending_review') {
      return c.status === 'documents_pending' || c.status === 'family_review'
    }
    if (activeTab === 'completed') {
      return c.status === 'completed'
    }

    return true
  })

  // Metric counts
  const totalCases = cases.length
  const activeCount = cases.filter((c) => c.status !== 'completed').length
  const pendingReviewCount = cases.filter(
    (c) => c.status === 'documents_pending' || c.status === 'family_review'
  ).length
  const completedCount = cases.filter((c) => c.status === 'completed').length
  const servicesScheduledCount = cases.filter((c) => Boolean(c.service_date) && c.status !== 'completed').length

  const counts = {
    all: totalCases,
    active: activeCount,
    pending_review: pendingReviewCount,
    completed: completedCount,
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body flex flex-col selection:bg-[#A8935D] selection:text-white">
      {/* Top Header Navigation */}
      <DashboardHeader
        funeralHomeName={funeralHomeName}
        staffName={staffName}
      />


      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Title Bar & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white text-[#8C7E6E] text-[11px] font-semibold uppercase tracking-wider mb-2 border border-[#E5E2DC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A8935D]" />
              Operations Dashboard
            </div>
            <h1 className="text-3xl font-display font-medium text-[#2C221E] tracking-tight">
              Active Case Ledger
            </h1>
            <p className="text-sm text-[#6B5E50] mt-1">
              Overview of all active intakes, AI obituary drafting, and family arrangements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cases/new"
              className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-5 py-2.5 h-10 shadow-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Case Intake
            </Link>
          </div>
        </div>

        {/* Overview Stats Bento Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded border border-[#E5E2DC] shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6E]">Active Cases</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-display font-semibold text-[#2C221E]">{activeCount}</span>
              <span className="text-[10px] font-mono text-[#346538] bg-[#EDF3EC] px-1.5 py-0.5 rounded">Current</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-[#E5E2DC] shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6E]">Pending Review</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-display font-semibold text-[#A8935D]">{pendingReviewCount}</span>
              <span className="text-[10px] font-mono text-[#956400] bg-[#FBF3DB] px-1.5 py-0.5 rounded">Action Req</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-[#E5E2DC] shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6E]">Services Scheduled</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-display font-semibold text-[#2C221E]">{servicesScheduledCount}</span>
              <span className="text-[10px] font-mono text-[#1F6C9F] bg-[#E1F3FE] px-1.5 py-0.5 rounded">Upcoming</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-[#E5E2DC] shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6E]">Completed Archives</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-display font-semibold text-[#6B5E50]">{completedCount}</span>
              <span className="text-[10px] font-mono text-[#6B5E50] bg-[#FAF9F7] px-1.5 py-0.5 rounded border border-[#E5E2DC]">Total</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Search Bar */}
        <div className="bg-white rounded border border-[#E5E2DC] p-3.5 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center overflow-x-auto gap-1.5 p-1 bg-[#FAF9F7] rounded border border-[#E5E2DC] text-xs">
            {(
              [
                { key: 'all', label: 'All Cases' },
                { key: 'active', label: 'Active' },
                { key: 'pending_review', label: 'Pending Review' },
                { key: 'completed', label: 'Completed' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`tab-btn focus-ring ${isActive ? 'tab-active' : 'tab-inactive'}`}
                >
                  <span>{tab.label}</span>
                  <span className={isActive ? 'tab-badge-active' : 'tab-badge-inactive'}>
                    {counts[tab.key]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deceased or family name..."
              className="w-full text-xs bg-[#FAF9F7] border border-[#E5E2DC] rounded pl-9 pr-3 py-2 text-[#2C221E] placeholder:text-[#8C7E6E] focus:outline-none focus:border-[#A8935D] focus:bg-white transition-colors"
            />
            <svg
              className="w-4 h-4 text-[#8C7E6E] absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Case Cards Grid */}
        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c, index) => (
              <div
                key={c.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
              >
                <CaseCard
                  caseData={c}
                  documents={documentsMap[c.id] || []}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded shadow-sm overflow-hidden border border-[#E5E2DC]">
            <div className="brass-inlay" />
            <div className="p-10 sm:p-14 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-xl bg-[#2C221E] text-[#D4C596] border border-[#1A1310] flex items-center justify-center mx-auto mb-5 font-display text-xl font-bold shadow-sm">
                M
              </div>
              <h3 className="text-xl font-display font-semibold text-[#2C221E] mb-2">
                {searchQuery
                  ? 'No matching cases found'
                  : `Welcome to Memoria — Your Case Ledger is Ready`}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B5E50] mb-8 leading-relaxed">
                {searchQuery
                  ? `No cases matched "${searchQuery}". Try adjusting or clearing your search filter.`
                  : 'Start by recording decedent details and family contacts from a first-call intake to generate AI obituaries and pre-fill compliance paperwork.'}
              </p>

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-[#A8935D] hover:underline"
                >
                  Clear search filter
                </button>
              ) : (
                <div className="space-y-6">
                  <Link
                    href="/dashboard/cases/new"
                    className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-6 py-3 inline-block shadow-sm"
                  >
                    Record First Case Intake
                  </Link>

                  {/* 3 Step Quickstart Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#E5E2DC] text-left text-xs">
                    <div className="p-3 rounded bg-[#FAF9F7] border border-[#E5E2DC]">
                      <span className="text-[10px] font-bold text-[#A8935D] uppercase block mb-1">01. Intake</span>
                      <p className="text-[11px] text-[#6B5E50] font-medium">Record decedent &amp; family informant details</p>
                    </div>
                    <div className="p-3 rounded bg-[#FAF9F7] border border-[#E5E2DC]">
                      <span className="text-[10px] font-bold text-[#A8935D] uppercase block mb-1">02. Tribute</span>
                      <p className="text-[11px] text-[#6B5E50] font-medium">AI obituary drafting in 3 respectful tones</p>
                    </div>
                    <div className="p-3 rounded bg-[#FAF9F7] border border-[#E5E2DC]">
                      <span className="text-[10px] font-bold text-[#A8935D] uppercase block mb-1">03. Compliance</span>
                      <p className="text-[11px] text-[#6B5E50] font-medium">Pre-fill state vital stats &amp; permit PDFs</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


      </main>
    </div>
  )
}
