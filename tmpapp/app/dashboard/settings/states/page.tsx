'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

interface RegisteredState {
  id: string
  state_id: string
  is_primary: boolean
  name: string
  abbreviation: string
  created_at: string
}

interface AvailableState {
  id: string
  name: string
  abbreviation: string
}

export default function SettingsStatesPage() {
  const [registeredStates, setRegisteredStates] = useState<RegisteredState[]>([])
  const [allStates, setAllStates] = useState<AvailableState[]>([])
  const [selectedAddStateId, setSelectedAddStateId] = useState('')
  const [funeralHomeName, setFuneralHomeName] = useState('Memoria Memorial Home')
  const [staffName, setStaffName] = useState('Director')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function loadData() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/funeral-home/states')
      if (!res.ok) {
        throw new Error('Failed to load registered states')
      }
      const json = await res.json()
      setRegisteredStates(json.registeredStates || [])
      setAllStates(json.allStates || [])
      if (json.allStates?.length > 0) {
        setSelectedAddStateId(json.allStates[0].id)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching states')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Load branding info
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const json = await res.json()
          if (json.funeralHome?.name) setFuneralHomeName(json.funeralHome.name)
          if (json.profile?.full_name) setStaffName(json.profile.full_name)
          if (json.profile?.is_super_admin) setIsSuperAdmin(true)
        }
      } catch {}
    }
    loadStatus()
  }, [])

  async function handleAddState(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAddStateId) return
    setError(null)
    setSuccessMsg(null)
    setIsAdding(true)

    try {
      const res = await fetch('/api/funeral-home/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_id: selectedAddStateId }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to add state')
      }

      setSuccessMsg('State added to your operating jurisdictions.')
      loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add state')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleSetPrimary(stateId: string, stateName: string) {
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/funeral-home/states', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state_id: stateId }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update primary state')
      }

      setSuccessMsg(`${stateName} is now set as your Primary Operating State.`)
      loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update primary state')
    }
  }

  async function handleRemoveState(stateId: string, stateName: string) {
    if (!confirm(`Are you sure you want to remove ${stateName} from your operating states?`)) return
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/funeral-home/states?state_id=${stateId}`, {
        method: 'DELETE',
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to remove state')
      }

      setSuccessMsg(`${stateName} removed.`)
      loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove state')
    }
  }

  // Available states that are NOT yet registered
  const registeredIds = new Set(registeredStates.map((s) => s.state_id))
  const unselectedStates = allStates.filter((s) => !registeredIds.has(s.id))

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1310] font-body flex flex-col selection:bg-[#A8935D] selection:text-white">
      <DashboardHeader
        funeralHomeName={funeralHomeName}
        staffName={staffName}
        isSuperAdmin={isSuperAdmin}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/dashboard/compliance"
                className="text-xs text-[#8C7E6E] hover:text-[#2C221E] transition-colors"
              >
                &larr; Back to Compliance Library
              </Link>
            </div>
            <h1 className="text-3xl font-display font-semibold text-[#2C221E] tracking-tight">
              Operating State Jurisdictions
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E50] mt-1">
              Configure the US states where your funeral home licenses, satellite chapels, and permits operate.
            </p>
          </div>

          <Link
            href="/dashboard/compliance"
            className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-4 py-2.5 h-10 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View State Forms &rarr;</span>
          </Link>
        </div>

        {error && (
          <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3.5 text-xs text-[#9F2F2D] rounded-r">
            <strong>Action Alert: </strong>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="border-l-2 border-[#346538] bg-[#EDF3EC] p-3.5 text-xs text-[#346538] rounded-r">
            {successMsg}
          </div>
        )}

        {/* Add State Card */}
        {unselectedStates.length > 0 && (
          <div className="card-premium p-6 relative">
            <div className="brass-inlay absolute top-0 left-0 right-0" />
            <h2 className="font-display text-base font-semibold text-[#2C221E] mb-1">
              Add Additional Operating State
            </h2>
            <p className="text-xs text-[#6B5E50] mb-4">
              Select a new jurisdiction to unlock its legal forms, death certificate requirements, and compliance rules.
            </p>

            <form onSubmit={handleAddState} className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedAddStateId}
                onChange={(e) => setSelectedAddStateId(e.target.value)}
                className="flex-1 w-full bg-[#FAF9F7] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] font-medium focus:bg-white focus:border-[#A8935D] focus:outline-none"
              >
                {unselectedStates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.abbreviation})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isAdding}
                className="btn-primary !w-auto text-xs font-semibold uppercase tracking-wider px-6 py-2.5 h-10 shrink-0 w-full sm:w-auto"
              >
                {isAdding ? 'Adding…' : '+ Add State'}
              </button>
            </form>
          </div>
        )}

        {/* Registered States List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-[#2C221E]">
              Configured Jurisdictions ({registeredStates.length})
            </h2>
            <span className="text-xs text-[#8C7E6E]">
              1 Primary Required
            </span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#8C7E6E]">
                Loading jurisdictions…
              </div>
            ) : registeredStates.length === 0 ? (
              <div className="card-premium p-8 text-center text-xs text-[#8C7E6E]">
                No operating states registered.
              </div>
            ) : (
              registeredStates.map((st) => (
                <div
                  key={st.id}
                  className={`card-premium p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    st.is_primary ? 'border-[#A8935D] bg-white shadow-sm' : 'bg-[#FAF9F7]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded font-mono text-sm font-bold flex items-center justify-center border ${
                        st.is_primary
                          ? 'bg-[#2C221E] text-[#D4C596] border-[#1A1310]'
                          : 'bg-white text-[#6B5E50] border-[#E5E2DC]'
                      }`}
                    >
                      {st.abbreviation}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#2C221E]">{st.name}</span>
                        {st.is_primary && (
                          <span className="px-2 py-0.5 rounded-full bg-[#EDF3EC] text-[#346538] text-[10px] font-bold uppercase font-mono">
                            Primary State
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8C7E6E] mt-0.5">
                        {st.is_primary
                          ? 'Default jurisdiction for all new cases and compliance filings.'
                          : 'Secondary jurisdiction for regional branch services.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link
                      href={`/dashboard/compliance?state_id=${st.state_id}`}
                      className="text-xs text-[#A8935D] hover:underline font-semibold px-2 py-1"
                    >
                      View Forms &rarr;
                    </Link>

                    {!st.is_primary && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(st.state_id, st.name)}
                          className="text-xs font-semibold text-[#2C221E] hover:bg-[#EFECE6] px-2.5 py-1 rounded border border-[#E5E2DC] transition-colors"
                        >
                          Set as Primary
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveState(st.state_id, st.name)}
                          className="text-xs font-semibold text-[#9F2F2D] hover:bg-[#FDEBEC] px-2.5 py-1 rounded border border-[#E5E2DC] transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
