'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'

export default function OnboardingStep4Page() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to load status:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSummary()
  }, [])

  // Calculate 30-day trial end date
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 30)
  const formattedTrialDate = trialEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const funeralHomeName = data?.funeralHome?.name || 'Your Funeral Home'
  const primaryState = data?.funeralHome?.state || 'TX'
  const totalStates = (data?.states?.length || 1)
  const staffCount = data?.invitedStaff?.length || 0
  const ownerName = data?.profile?.full_name || 'Managing Director'

  return (
    <div className="card-premium p-6 sm:p-10 relative">
      <div className="brass-inlay absolute top-0 left-0 right-0" />

      <OnboardingHeader
        currentStep={4}
        title="Setup Complete — Welcome to Memoria"
        subtitle="Your funeral home workspace is configured and ready for your cases."
        backUrl="/onboarding/step-3"
      />

      <div className="space-y-6">
        {/* Success Banner */}
        <div className="bg-[#FAF9F7] border border-[#DCD7CD] p-6 rounded text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#346538] text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
            ✓
          </div>
          <h2 className="font-display text-xl font-semibold text-[#2C221E]">
            {funeralHomeName} is Ready
          </h2>
          <p className="text-xs text-[#6B5E50] mt-1 max-w-md mx-auto">
            Your secure multi-tenant environment, state compliance rules, and AI agents have been initialized.
          </p>
        </div>

        {/* 30-Day Trial Countdown Widget */}
        <div className="bg-[#F5F1E9] border-l-4 border-[#A8935D] p-4 rounded-r flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8935D]">
                30-Day Full Access Trial Active
              </span>
              <span className="text-[10px] bg-[#A8935D] text-white px-2 py-0.5 rounded-full font-semibold">
                30 Days Left
              </span>
            </div>
            <p className="text-xs text-[#2C221E] font-medium mt-1">
              Your free trial ends on <strong className="underline decoration-[#A8935D]">{formattedTrialDate}</strong>.
            </p>
          </div>
          <div className="text-[11px] text-[#8C7E6E]">
            No credit card billed until trial concludes.
          </div>
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white border border-[#E5E2DC] rounded">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C7E6E] block">
              Director / Owner
            </span>
            <span className="text-xs font-semibold text-[#2C221E] mt-1 block truncate">
              {ownerName}
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E5E2DC] rounded">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C7E6E] block">
              Primary Jurisdiction
            </span>
            <span className="text-xs font-semibold text-[#2C221E] mt-1 block">
              {primaryState} ({totalStates} {totalStates === 1 ? 'state' : 'states'})
            </span>
          </div>

          <div className="p-3.5 bg-white border border-[#E5E2DC] rounded">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C7E6E] block">
              Team Members
            </span>
            <span className="text-xs font-semibold text-[#2C221E] mt-1 block">
              {staffCount > 0 ? `${staffCount} invited` : '1 (Director)'}
            </span>
          </div>
        </div>

        {/* Action Button: Go to Dashboard */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E2DC]">
          <Link
            href="/onboarding/step-3"
            className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors py-2 px-3"
          >
            &larr; Review Team Invites
          </Link>

          <button
            type="button"
            onClick={() => {
              router.push('/dashboard')
              router.refresh()
            }}
            className="btn-primary h-12 px-8 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
          >
            <span>Launch Director Dashboard →</span>
          </button>
        </div>
      </div>
    </div>
  )
}
