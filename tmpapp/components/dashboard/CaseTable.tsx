'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/cases/StatusBadge'
import type { CaseRecord, Document } from '@/types'

export type FilterTab = 'all' | 'active' | 'pending_review' | 'completed'

interface CaseTableProps {
  cases: CaseRecord[]
  documentsMap: Record<string, Document[]>
  searchQuery: string
}

export default function CaseTable({
  cases,
  documentsMap,
  searchQuery,
}: CaseTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set())
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      q === '' ||
      c.deceased_name.toLowerCase().includes(q) ||
      c.family_contact_name.toLowerCase().includes(q) ||
      (c.service_location && c.service_location.toLowerCase().includes(q))

    if (!matchesSearch) return false

    if (serviceFilter !== 'all' && c.service_type !== serviceFilter) {
      return false
    }

    if (activeTab === 'all') return true
    if (activeTab === 'active') return c.status !== 'completed'
    if (activeTab === 'pending_review') {
      return c.status === 'documents_pending' || c.status === 'family_review'
    }
    if (activeTab === 'completed') return c.status === 'completed'

    return true
  })

  // Sort
  filteredCases.sort((a, b) => {
    if (sortBy === 'name') return a.deceased_name.localeCompare(b.deceased_name)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const toggleSelectAll = () => {
    if (selectedCaseIds.size === filteredCases.length) {
      setSelectedCaseIds(new Set())
    } else {
      setSelectedCaseIds(new Set(filteredCases.map((c) => c.id)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedCaseIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedCaseIds(next)
  }

  const counts = {
    all: cases.length,
    active: cases.filter((c) => c.status !== 'completed').length,
    pending_review: cases.filter(
      (c) => c.status === 'documents_pending' || c.status === 'family_review'
    ).length,
    completed: cases.filter((c) => c.status === 'completed').length,
  }

  return (
    <div className="card-premium overflow-hidden space-y-0">
      {/* Table Header Controls & Filter Pills */}
      <div className="p-4 sm:p-5 border-b border-[#E5E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F7]/50">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Cases', count: counts.all },
              { id: 'active', label: 'Active Pipeline', count: counts.active },
              { id: 'pending_review', label: 'Review & Docs', count: counts.pending_review },
              { id: 'completed', label: 'Completed', count: counts.completed },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#2C221E] text-[#D4C596] shadow-2xs font-bold'
                    : 'text-[#6B5E50] hover:text-[#2C221E] hover:bg-[#F2EFEA]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-[#1A1310] text-[#D4C596]' : 'bg-[#E5E2DC] text-[#6B5E50]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-white border border-[#E5E2DC] rounded-lg px-2.5 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#A8935D]"
          >
            <option value="all">All Service Types</option>
            <option value="burial">Traditional Burial</option>
            <option value="cremation">Cremation</option>
            <option value="memorial">Memorial Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-[#E5E2DC] rounded-lg px-2.5 py-1.5 text-xs text-[#2C221E] focus:outline-none focus:border-[#A8935D]"
          >
            <option value="date">Sort by Recent</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Contextual Bulk Action Bar (Revealed if rows selected) */}
      {selectedCaseIds.size > 0 && (
        <div className="bg-[#2C221E] text-[#FAF9F7] px-5 py-2.5 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#A8935D]" />
            <span>{selectedCaseIds.size} cases selected</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert(`Exporting ${selectedCaseIds.size} case summaries.`)}
              className="text-[#D4C596] hover:underline font-bold text-xs"
            >
              Export Selected
            </button>
            <span className="text-[#8C7E6E]">•</span>
            <button
              type="button"
              onClick={() => setSelectedCaseIds(new Set())}
              className="text-[#B0A393] hover:text-white"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Primary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E5E2DC] bg-[#FAF9F7] text-[#8C7E6E] uppercase font-bold text-[10px] tracking-wider select-none">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={filteredCases.length > 0 && selectedCaseIds.size === filteredCases.length}
                  onChange={toggleSelectAll}
                  className="rounded text-[#2C221E] focus:ring-[#A8935D]"
                />
              </th>
              <th className="py-3 px-4">Case &amp; Decedent</th>
              <th className="py-3 px-4">Arrangement Type</th>
              <th className="py-3 px-4">Family Contact</th>
              <th className="py-3 px-4">Status &amp; Stage</th>
              <th className="py-3 px-4">Service Schedule</th>
              <th className="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E5E2DC] bg-white">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#8C7E6E]">
                  No cases found matching your active filter or search query.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCaseIds.has(c.id)
                const docCount = (documentsMap[c.id] || []).length
                const createdDate = new Date(c.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                const serviceDateStr = c.service_date
                  ? new Date(c.service_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Pending Scheduling'

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#FAF9F7]/80 transition-colors group ${
                      isSelected ? 'bg-[#FBF3DB]/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(c.id)}
                        className="rounded text-[#2C221E] focus:ring-[#A8935D]"
                      />
                    </td>

                    {/* Decedent & Case ID */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/cases/${c.id}`}
                        className="font-semibold text-sm text-[#2C221E] group-hover:text-[#A8935D] transition-colors block"
                      >
                        {c.deceased_name}
                      </Link>
                      <span className="text-[10px] font-mono text-[#8C7E6E] block mt-0.5">
                        CASE-#{c.id.slice(0, 8)} • Added {createdDate}
                      </span>
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F2EFEA] text-[#2C221E] uppercase font-mono">
                        {c.service_type === 'burial' ? '⚰️ Traditional Burial' : '🏺 Cremation'}
                      </span>
                    </td>

                    {/* Family Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F2EFEA] text-[#2C221E] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {c.family_contact_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-[#2C221E] block">
                            {c.family_contact_name}
                          </span>
                          <span className="text-[10px] text-[#8C7E6E] block">
                            {c.relationship_to_deceased}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Schedule */}
                    <td className="py-3.5 px-4">
                      <span className="text-[#2C221E] font-medium block">
                        {serviceDateStr}
                      </span>
                      <span className="text-[10px] text-[#8C7E6E] block truncate max-w-[140px]">
                        {c.service_location || 'Main Chapel'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/cases/${c.id}/obituary`}
                          title="Obituary Studio"
                          className="px-2 py-1 rounded bg-[#FAF9F7] border border-[#E5E2DC] text-[11px] font-semibold text-[#6B5E50] hover:text-[#2C221E] hover:border-[#A8935D]"
                        >
                          Obituary
                        </Link>
                        <Link
                          href={`/dashboard/cases/${c.id}/documents`}
                          title="Compliance Documents"
                          className="px-2 py-1 rounded bg-[#FAF9F7] border border-[#E5E2DC] text-[11px] font-semibold text-[#6B5E50] hover:text-[#2C221E] hover:border-[#A8935D]"
                        >
                          Docs ({docCount})
                        </Link>
                        <Link
                          href={`/dashboard/cases/${c.id}`}
                          className="px-2 py-1 rounded bg-[#2C221E] text-[#D4C596] text-[11px] font-bold hover:bg-[#3F322D]"
                        >
                          Open &rarr;
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
