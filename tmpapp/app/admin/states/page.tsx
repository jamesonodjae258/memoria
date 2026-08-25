'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { US_STATES } from '@/lib/constants/states'

interface StateItem {
  id: string
  name: string
  abbreviation: string
  is_active: boolean
  template_count: number
  created_at: string
}

export default function AdminStatesPage() {
  const [states, setStates] = useState<StateItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Add state inline form fields
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAbbr, setNewAbbr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick search filter
  const [search, setSearch] = useState('')

  async function loadStates() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/states')
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load states')
      }
      const json = await res.json()
      setStates(json.states || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching states')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStates()
  }, [])

  async function handleAddState(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          abbreviation: newAbbr,
          is_active: true,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to add state')
      }

      setSuccessMsg(`Added state ${json.state.name} (${json.state.abbreviation}) successfully.`)
      setNewName('')
      setNewAbbr('')
      setShowAddForm(false)
      loadStates()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add state')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/states', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: !currentActive,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update state status')
      }

      setStates(states.map((s) => (s.id === id ? { ...s, is_active: !currentActive } : s)))
      setSuccessMsg(`State updated: ${!currentActive ? 'Activated' : 'Deactivated'}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle active state')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/admin/states?id=${id}`, {
        method: 'DELETE',
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete state')
      }

      setSuccessMsg(`Deleted state ${name} successfully.`)
      loadStates()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete state')
    }
  }

  async function seedAllStates() {
    if (!confirm('This will populate any missing US states in the database. Proceed?')) return
    setIsSubmitting(true)
    setError(null)
    try {
      for (const s of US_STATES) {
        await fetch('/api/admin/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: s.name,
            abbreviation: s.abbreviation,
            is_active: true,
          }),
        })
      }
      setSuccessMsg('All 50 US states initialized in the database.')
      loadStates()
    } catch (err: unknown) {
      setError('Error while seeding states')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = states.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">States Registry</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage US states, active statuses, and attached compliance document requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {states.length < 50 && (
            <button
              type="button"
              onClick={seedAllStates}
              disabled={isSubmitting}
              className="px-3 py-2 rounded bg-[#334155] hover:bg-[#475569] text-xs font-semibold text-white transition-colors"
            >
              {isSubmitting ? 'Seeding…' : 'Seed All 50 US States'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>{showAddForm ? '✕ Close Form' : '+ Add State'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-[#451A1A] border-l-4 border-[#EF4444] p-3 text-xs text-[#FCA5A5] rounded-r">
          <strong>Action Blocked: </strong>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-[#064E3B] border-l-4 border-[#10B981] p-3 text-xs text-[#6EE7B7] rounded-r">
          {successMsg}
        </div>
      )}

      {/* Inline Add State Form */}
      {showAddForm && (
        <div className="bg-[#1E293B] border border-[#38BDF8]/40 p-5 rounded-lg">
          <h2 className="text-sm font-semibold text-white mb-3">Add New US State / Jurisdiction</h2>
          <form onSubmit={handleAddState} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-[#94A3B8] uppercase block mb-1">
                State Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Pennsylvania"
                required
                className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#94A3B8] uppercase block mb-1">
                2-Letter Abbreviation *
              </label>
              <input
                type="text"
                maxLength={2}
                value={newAbbr}
                onChange={(e) => setNewAbbr(e.target.value.toUpperCase())}
                placeholder="PA"
                required
                className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-xs text-white font-mono uppercase focus:border-[#38BDF8] focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-[#0F172A] text-xs font-bold transition-colors"
              >
                {isSubmitting ? 'Saving…' : 'Save State'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state name or abbreviation…"
            className="w-full bg-[#1E293B] border border-[#334155] rounded p-2 text-xs text-white pl-8 focus:border-[#38BDF8] focus:outline-none"
          />
          <span className="absolute left-2.5 top-2 text-[#94A3B8] text-xs">🔍</span>
        </div>

        <div className="text-xs text-[#94A3B8] font-mono">
          Showing {filtered.length} of {states.length} states
        </div>
      </div>

      {/* States Table */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">Loading states…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">
            No states found matching &quot;{search}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] text-[#94A3B8] border-b border-[#334155]">
                <tr>
                  <th className="p-3.5 font-medium">Abbreviation</th>
                  <th className="p-3.5 font-medium">State Name</th>
                  <th className="p-3.5 font-medium">Active Status</th>
                  <th className="p-3.5 font-medium">Compliance Templates</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-[#CBD5E1]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#334155]/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white text-sm">
                      {s.abbreviation}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {s.name}
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => toggleActive(s.id, s.is_active)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          s.is_active
                            ? 'bg-[#064E3B] text-[#34D399] hover:bg-[#065F46]'
                            : 'bg-[#451A1A] text-[#F87171] hover:bg-[#581C1C]'
                        }`}
                        title="Click to toggle active status"
                      >
                        {s.is_active ? 'Active (Shown)' : 'Hidden (Inactive)'}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/admin/compliance?state_id=${s.id}`}
                        className="text-[#38BDF8] hover:underline font-mono"
                      >
                        {s.template_count} template{s.template_count === 1 ? '' : 's'} &rarr;
                      </Link>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/compliance/new?state_id=${s.id}`}
                        className="text-[11px] text-[#38BDF8] hover:underline"
                      >
                        + Add Template
                      </Link>
                      <span className="text-[#475569]">•</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-[11px] text-[#EF4444] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
