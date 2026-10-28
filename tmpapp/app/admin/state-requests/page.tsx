'use client'

import { useState, useEffect } from 'react'

interface StateRequestItem {
  id: string
  state_name: string
  contact_email: string
  status: string
  created_at: string
  funeral_homes?: { name: string } | null
}

export default function AdminStateRequestsPage() {
  const [requests, setRequests] = useState<StateRequestItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function loadRequests() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/state-requests')
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to load state requests')
      }
      const json = await res.json()
      setRequests(json.requests || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching state requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleMarkDone(id: string) {
    setUpdatingId(id)
    setError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch('/api/admin/state-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'done' }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update request')
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'done' } : r))
      )
      setSuccessMessage('State request marked as done.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating request')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-widest text-[#38BDF8] font-bold">
            Jurisdiction Backlog
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            State Requests
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Requests from funeral homes for states that do not yet have compliance templates.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={isLoading}
          className="px-3.5 py-2 rounded bg-[#334155] hover:bg-[#475569] text-xs font-semibold text-white transition-colors self-start sm:self-auto"
        >
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-[#450A0A] border border-[#991B1B] text-xs text-[#FCA5A5]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded bg-[#064E3B] border border-[#059669] text-xs text-[#6EE7B7]">
          {successMessage}
        </div>
      )}

      {/* Requests Table */}
      <div className="rounded-lg border border-[#334155] bg-[#1E293B] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            Loading state requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#94A3B8]">
            No state requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Funeral Home</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] text-[#E2E8F0]">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#334155]/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8]">
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {req.state_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#CBD5E1]">
                      {req.funeral_homes?.name || 'New Onboarding'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <a
                        href={`mailto:${req.contact_email}`}
                        className="text-[#38BDF8] hover:underline"
                      >
                        {req.contact_email}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'done'
                            ? 'bg-[#064E3B] text-[#6EE7B7] border border-[#059669]'
                            : 'bg-[#451A03] text-[#FDBA74] border border-[#B45309]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status !== 'done' ? (
                        <button
                          type="button"
                          onClick={() => handleMarkDone(req.id)}
                          disabled={updatingId === req.id}
                          className="px-3 py-1.5 rounded bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A] font-semibold text-xs transition-colors"
                        >
                          {updatingId === req.id ? 'Updating...' : 'Mark as done'}
                        </button>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px] italic">
                          Completed
                        </span>
                      )}
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
