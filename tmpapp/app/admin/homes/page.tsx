'use client'

import { useState, useEffect } from 'react'

interface FuneralHomeItem {
  id: string
  name: string
  state: string
  street_address: string | null
  city: string | null
  zip: string | null
  phone: string | null
  email: string
  owner_name: string
  staff_count: number
  case_count: number
  subscription_status: string
  subscription_plan: string
  trial_ends_at: string | null
  created_at: string
}

export default function AdminHomesPage() {
  const [homes, setHomes] = useState<FuneralHomeItem[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedHome, setSelectedHome] = useState<FuneralHomeItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadHomes() {
    setIsLoading(true)
    setError(null)
    try {
      const url =
        statusFilter !== 'all'
          ? `/api/admin/homes?status=${statusFilter}`
          : '/api/admin/homes'
      const res = await fetch(url)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load funeral homes')
      }
      const json = await res.json()
      setHomes(json.homes || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching homes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHomes()
  }, [statusFilter])

  const filtered = homes.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      h.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      h.state.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Funeral Homes &amp; Subscriptions
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            View all tenant accounts, subscription status, trial expirations, and case volume.
          </p>
        </div>

        <div className="text-xs text-[#94A3B8] font-mono bg-[#1E293B] border border-[#334155] px-3 py-2 rounded">
          Total Tenants: <strong className="text-white">{homes.length}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#451A1A] border-l-4 border-[#EF4444] p-3 text-xs text-[#FCA5A5] rounded-r">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded border border-[#334155] text-xs">
          {['all', 'trial', 'active', 'past_due', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#38BDF8] text-[#0F172A] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or state…"
            className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-xs text-white pl-8 focus:border-[#38BDF8] focus:outline-none"
          />
          <span className="absolute left-2.5 top-2 text-[#94A3B8] text-xs">🔍</span>
        </div>
      </div>

      {/* Homes Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">Loading funeral homes…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">
            No funeral homes match your search or filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-[#94A3B8] border-b border-[#334155]">
                <tr>
                  <th className="p-3.5 font-medium">Funeral Home Name</th>
                  <th className="p-3.5 font-medium">State</th>
                  <th className="p-3.5 font-medium">Owner / Contact</th>
                  <th className="p-3.5 font-medium">Plan</th>
                  <th className="p-3.5 font-medium">Subscription Status</th>
                  <th className="p-3.5 font-medium">Cases</th>
                  <th className="p-3.5 font-medium">Trial / Renewal</th>
                  <th className="p-3.5 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-[#CBD5E1]">
                {filtered.map((home) => (
                  <tr
                    key={home.id}
                    onClick={() => setSelectedHome(home)}
                    className="hover:bg-[#334155]/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-semibold text-white">
                      {home.name}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-[#38BDF8]">
                      {home.state}
                    </td>

                    <td className="p-3.5">
                      <div className="text-white font-medium">{home.owner_name}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">{home.email}</div>
                    </td>

                    <td className="p-3.5 uppercase font-mono text-[11px] font-semibold">
                      {home.subscription_plan || 'starter'}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          home.subscription_status === 'active'
                            ? 'bg-[#064E3B] text-[#34D399]'
                            : home.subscription_status === 'trial'
                            ? 'bg-[#78350F] text-[#FBBF24]'
                            : 'bg-[#451A1A] text-[#F87171]'
                        }`}
                      >
                        {home.subscription_status || 'trial'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono font-semibold text-white">
                      {home.case_count}
                    </td>

                    <td className="p-3.5 text-[#94A3B8] font-mono text-[11px]">
                      {home.trial_ends_at
                        ? new Date(home.trial_ends_at).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="p-3.5 text-right">
                      <span className="text-[11px] text-[#38BDF8] hover:underline">
                        View &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedHome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1E293B] border border-[#334155] w-full max-w-xl rounded-lg p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedHome(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                Tenant Account Details
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {selectedHome.name}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                ID: <span className="font-mono">{selectedHome.id}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#0F172A] p-4 rounded border border-[#334155]">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Primary State
                </span>
                <span className="text-white font-medium font-mono">{selectedHome.state}</span>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Telephone
                </span>
                <span className="text-white font-medium">{selectedHome.phone || '—'}</span>
              </div>

              <div className="col-span-2">
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Physical Address
                </span>
                <span className="text-white font-medium">
                  {selectedHome.street_address
                    ? `${selectedHome.street_address}, ${selectedHome.city || ''} ${selectedHome.state} ${selectedHome.zip || ''}`
                    : '—'}
                </span>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Owner Name
                </span>
                <span className="text-white font-medium">{selectedHome.owner_name}</span>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Owner Email
                </span>
                <span className="text-white font-mono">{selectedHome.email}</span>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Total Active Cases
                </span>
                <span className="text-white font-bold font-mono text-sm">{selectedHome.case_count} cases</span>
              </div>

              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">
                  Staff Members
                </span>
                <span className="text-white font-bold font-mono text-sm">{selectedHome.staff_count} staff</span>
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4 flex items-center justify-between">
              <div className="text-xs text-[#94A3B8]">
                Created: {new Date(selectedHome.created_at).toLocaleDateString()}
              </div>

              <button
                type="button"
                onClick={() => setSelectedHome(null)}
                className="px-4 py-2 rounded bg-[#334155] hover:bg-[#475569] text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
