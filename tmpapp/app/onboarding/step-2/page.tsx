'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'
import { US_STATES, USState } from '@/lib/constants/states'

export default function OnboardingStep2Page() {
  const router = useRouter()
  const [primaryState, setPrimaryState] = useState('TX')
  const [additionalStates, setAdditionalStates] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch pre-existing values if user is resuming
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const data = await res.json()
          if (data.funeralHome?.state) {
            setPrimaryState(data.funeralHome.state)
          }
          if (Array.isArray(data.states) && data.states.length > 0) {
            const primary = data.states.find((s: any) => s.is_primary)
            if (primary?.states?.abbreviation) {
              setPrimaryState(primary.states.abbreviation)
            }
            const others = data.states
              .filter((s: any) => !s.is_primary)
              .map((s: any) => s.states?.abbreviation)
              .filter(Boolean)
            setAdditionalStates(others)
          }
        }
      } catch {
        // Ignore prefetch failures
      }
    }
    loadStatus()
  }, [])

  const filteredStates = US_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAdditionalState = (abbr: string) => {
    if (abbr === primaryState) return
    if (additionalStates.includes(abbr)) {
      setAdditionalStates(additionalStates.filter((s) => s !== abbr))
    } else {
      setAdditionalStates([...additionalStates, abbr])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!primaryState) {
      setError('Please select a primary operating state.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/onboarding/step-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_state: primaryState,
          additional_states: additionalStates.filter((s) => s !== primaryState),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save state selections.')
        return
      }

      router.push('/onboarding/step-3')
    } catch {
      setError('A network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-premium p-6 sm:p-10 relative">
      <div className="brass-inlay absolute top-0 left-0 right-0" />

      <OnboardingHeader
        currentStep={2}
        title="Select Operating States"
        subtitle="Memoria tailors state-specific compliance checklists, death certificates, and permit rules to your locations."
        backUrl="/onboarding/step-1"
      />

      {error && (
        <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3.5 text-xs text-[#9F2F2D] rounded-r mb-6">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary State Selection */}
        <div className="bg-[#FAF9F7] p-5 rounded border border-[#E5E2DC] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="primary-state-select" className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
              Primary Operating State *
            </label>
            <span className="text-[11px] text-[#A8935D] font-medium font-mono">
              Primary Jurisdiction
            </span>
          </div>

          <p className="text-xs text-[#6B5E50]">
            The main state where your headquarters or principal chapel is licensed.
          </p>

          <select
            id="primary-state-select"
            value={primaryState}
            onChange={(e) => {
              const val = e.target.value
              setPrimaryState(val)
              // If previously in additional, remove it
              setAdditionalStates(additionalStates.filter((s) => s !== val))
            }}
            disabled={isLoading}
            className="w-full bg-white border border-[#E5E2DC] rounded p-3 text-sm text-[#2C221E] font-medium focus:border-[#A8935D] focus:outline-none transition-colors"
          >
            {US_STATES.map((s) => (
              <option key={s.abbreviation} value={s.abbreviation}>
                {s.name} ({s.abbreviation})
              </option>
            ))}
          </select>
        </div>

        {/* Additional States Multi-select */}
        <div className="bg-[#FAF9F7] p-5 rounded border border-[#E5E2DC] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
                Additional Operating States (Optional)
              </h3>
              <p className="text-xs text-[#6B5E50] mt-0.5">
                Does your funeral home operate satellite locations, cross-border services, or regional branches?
              </p>
            </div>
            <div className="text-xs font-semibold text-[#2C221E] bg-white border border-[#E5E2DC] px-2.5 py-1 rounded">
              {additionalStates.length} additional selected
            </div>
          </div>

          {/* Filter Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search US states (e.g. Oklahoma, OK)…"
              className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] pl-8 focus:border-[#A8935D] focus:outline-none transition-colors"
            />
            <span className="absolute left-2.5 top-2.5 text-[#8C7E6E] text-xs">🔍</span>
          </div>

          {/* Scrollable State Chips Grid */}
          <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 border border-[#E5E2DC] bg-white p-3 rounded">
            {filteredStates.map((s: USState) => {
              const isPrimary = s.abbreviation === primaryState
              const isSelected = additionalStates.includes(s.abbreviation)

              return (
                <button
                  type="button"
                  key={s.abbreviation}
                  onClick={() => toggleAdditionalState(s.abbreviation)}
                  disabled={isPrimary || isLoading}
                  className={`p-2 rounded text-left border text-xs flex items-center justify-between transition-all ${
                    isPrimary
                      ? 'bg-[#EFECE6] border-[#D4C596] text-[#6B5E50] cursor-not-allowed opacity-80'
                      : isSelected
                      ? 'bg-[#2C221E] border-[#1A1310] text-[#D4C596] shadow-sm font-semibold'
                      : 'bg-[#FAF9F7] border-[#E5E2DC] text-[#2C221E] hover:border-[#A8935D]'
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="text-[10px] font-mono opacity-80 ml-1">
                    {isPrimary ? '(Primary)' : s.abbreviation}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step-1')}
            className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors py-2 px-3"
          >
            &larr; Back to Details
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary h-11 px-8 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            {isLoading ? 'Saving States…' : 'Next: Invite Team →'}
          </button>
        </div>
      </form>
    </div>
  )
}
