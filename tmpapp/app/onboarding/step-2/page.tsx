'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'

interface AvailableState {
  id: string
  name: string
  abbreviation: string
}

export default function OnboardingStep2Page() {
  const router = useRouter()
  const [availableStates, setAvailableStates] = useState<AvailableState[]>([
    { id: 'texas', name: 'Texas', abbreviation: 'TX' },
  ])
  const [selectedState, setSelectedState] = useState('TX')
  const [isNotListed, setIsNotListed] = useState(false)
  const [customStateName, setCustomStateName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingStates, setIsFetchingStates] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAvailableStates() {
      try {
        const res = await fetch('/api/states/available')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.states) && data.states.length > 0) {
            setAvailableStates(data.states)
            setSelectedState(data.states[0].abbreviation)
          }
        }
      } catch {
        // Fallback remains Texas
      } finally {
        setIsFetchingStates(false)
      }
    }

    loadAvailableStates()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (isNotListed) {
      if (!customStateName.trim()) {
        setError('Please enter the name of your state.')
        return
      }
    } else if (!selectedState) {
      setError('Please select an operating state.')
      return
    }

    setIsLoading(true)

    try {
      const payload = isNotListed
        ? {
            is_not_listed: true,
            requested_state_name: customStateName.trim(),
          }
        : {
            primary_state: selectedState,
            additional_states: [],
          }

      const res = await fetch('/api/onboarding/step-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save state selection.')
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
        title="Select Operating State"
        subtitle="Memoria prepares state specific filing summaries and vital worksheets for your location."
        backUrl="/onboarding/step-1"
      />

      {error && (
        <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3.5 text-xs text-[#9F2F2D] rounded-r mb-6">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operating State Selection */}
        <div className="bg-[#FAF9F7] p-5 rounded border border-[#E5E2DC] space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="state-select" className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
              Primary Operating State *
            </label>
            <span className="text-[11px] text-[#A8935D] font-medium font-mono">
              Live Jurisdictions
            </span>
          </div>

          <p className="text-xs text-[#6B5E50]">
            Select the primary state where your funeral home operates.
          </p>

          {!isNotListed && (
            <div>
              {isFetchingStates ? (
                <div className="text-xs text-[#8C7E6E] py-2">Loading available states...</div>
              ) : (
                <select
                  id="state-select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white border border-[#E5E2DC] rounded p-3 text-sm text-[#2C221E] font-medium focus:border-[#A8935D] focus:outline-none transition-colors"
                >
                  {availableStates.map((s) => (
                    <option key={s.abbreviation} value={s.abbreviation}>
                      {s.name} ({s.abbreviation})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Option: My state is not listed */}
          <div className="pt-2 border-t border-[#E5E2DC]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#2C221E]">
              <input
                type="checkbox"
                checked={isNotListed}
                onChange={(e) => {
                  setIsNotListed(e.target.checked)
                  setError(null)
                }}
                className="rounded border-[#D4C596] text-[#2C221E] focus:ring-[#A8935D]"
              />
              <span>My state is not listed</span>
            </label>
          </div>

          {isNotListed && (
            <div className="space-y-3 pt-2">
              <label htmlFor="custom-state-input" className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E] block">
                State Name *
              </label>
              <input
                id="custom-state-input"
                type="text"
                value={customStateName}
                onChange={(e) => setCustomStateName(e.target.value)}
                placeholder="For example: Oklahoma"
                disabled={isLoading}
                className="w-full bg-white border border-[#E5E2DC] rounded p-3 text-sm text-[#2C221E] font-medium focus:border-[#A8935D] focus:outline-none transition-colors"
              />
              <p className="text-xs text-[#6B5E50] leading-relaxed">
                We will email you when forms for your state are ready. You can continue setup now. Case intake, obituary drafting, and family emails will be available immediately.
              </p>
            </div>
          )}
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
            {isLoading ? 'Saving State...' : 'Next: Invite Team'}
          </button>
        </div>
      </form>
    </div>
  )
}
