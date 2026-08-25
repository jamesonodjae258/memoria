'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'
import { US_STATES } from '@/lib/constants/states'

export default function OnboardingStep1Page() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [funeralHomeName, setFuneralHomeName] = useState('')
  const [phone, setPhone] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('TX')
  const [zip, setZip] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pre-existing values if user is resuming
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const data = await res.json()
          if (data.profile?.full_name) {
            setFullName(data.profile.full_name)
          }
          if (data.funeralHome?.name && data.funeralHome.name !== 'Grace & Peace Chapel') {
            setFuneralHomeName(data.funeralHome.name)
          }
          if (data.funeralHome?.phone) {
            setPhone(data.funeralHome.phone)
          }
          if (data.funeralHome?.street_address) {
            setStreetAddress(data.funeralHome.street_address)
          }
          if (data.funeralHome?.city) {
            setCity(data.funeralHome.city)
          }
          if (data.funeralHome?.state) {
            setStateCode(data.funeralHome.state)
          }
          if (data.funeralHome?.zip) {
            setZip(data.funeralHome.zip)
          }
        }
      } catch {
        // Ignore prefetch failures
      } finally {
        setIsPrefetching(false)
      }
    }
    loadStatus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!funeralHomeName.trim()) {
      setError('Please provide your Funeral Home or Mortuary legal name.')
      return
    }

    if (!fullName.trim()) {
      setError('Please enter your full name as Owner / Managing Director.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/onboarding/step-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funeral_home_name: funeralHomeName,
          full_name: fullName,
          phone,
          street_address: streetAddress,
          city,
          state: stateCode,
          zip,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save funeral home details.')
        return
      }

      router.push('/onboarding/step-2')
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
        currentStep={1}
        title="Funeral Home & Owner Details"
        subtitle="Let's set up your facility identity, primary location, and owner profile."
      />

      {error && (
        <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3.5 text-xs text-[#9F2F2D] rounded-r mb-6">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Owner Details */}
        <div className="bg-[#FAF9F7] p-4 rounded border border-[#E5E2DC] space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
            1. Managing Director / Owner Profile
          </h3>
          <div>
            <label htmlFor="owner-fullname" className="field-label">
              Your Full Legal / Professional Name *
            </label>
            <input
              id="owner-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Eleanor Vance, Licensed Funeral Director"
              required
              disabled={isLoading || isPrefetching}
              className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Funeral Home Info */}
        <div className="bg-[#FAF9F7] p-4 rounded border border-[#E5E2DC] space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
            2. Facility &amp; Location Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fh-name" className="field-label">
                Funeral Home / Mortuary Name *
              </label>
              <input
                id="fh-name"
                type="text"
                value={funeralHomeName}
                onChange={(e) => setFuneralHomeName(e.target.value)}
                placeholder="e.g. Vance & Sons Memorial Chapel"
                required
                disabled={isLoading || isPrefetching}
                className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="fh-phone" className="field-label">
                Main Facility Telephone
              </label>
              <input
                id="fh-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 234-5678"
                disabled={isLoading || isPrefetching}
                className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fh-street" className="field-label">
              Street Address
            </label>
            <input
              id="fh-street"
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="1200 Memorial Parkway, Suite 100"
              disabled={isLoading || isPrefetching}
              className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="fh-city" className="field-label">
                City
              </label>
              <input
                id="fh-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                disabled={isLoading || isPrefetching}
                className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="fh-state" className="field-label">
                State
              </label>
              <select
                id="fh-state"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                disabled={isLoading || isPrefetching}
                className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
              >
                {US_STATES.map((s) => (
                  <option key={s.abbreviation} value={s.abbreviation}>
                    {s.name} ({s.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fh-zip" className="field-label">
                ZIP Code
              </label>
              <input
                id="fh-zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="78701"
                disabled={isLoading || isPrefetching}
                className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || isPrefetching}
            className="btn-primary h-11 px-8 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            {isLoading ? 'Saving Details…' : 'Next: Select States →'}
          </button>
        </div>
      </form>
    </div>
  )
}
