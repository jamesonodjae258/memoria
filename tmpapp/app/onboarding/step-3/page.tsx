'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingHeader from '@/components/onboarding/OnboardingHeader'

export default function OnboardingStep3Page() {
  const router = useRouter()
  const [emails, setEmails] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addEmailRow = () => {
    if (emails.length < 10) {
      setEmails([...emails, ''])
    }
  }

  const updateEmailRow = (index: number, value: string) => {
    const next = [...emails]
    next[index] = value
    setEmails(next)
  }

  const removeEmailRow = (index: number) => {
    if (emails.length === 1) {
      setEmails([''])
    } else {
      setEmails(emails.filter((_, i) => i !== index))
    }
  }

  async function submitInvites(skip: boolean) {
    setError(null)
    setIsLoading(true)

    const validEmails = skip
      ? []
      : emails.map((e) => e.trim()).filter((e) => e.length > 0 && e.includes('@'))

    try {
      const res = await fetch('/api/onboarding/step-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          skipped: skip,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to process team invites.')
        return
      }

      router.push('/onboarding/step-4')
    } catch {
      setError('A network error occurred while sending invitations.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card-premium p-6 sm:p-10 relative">
      <div className="brass-inlay absolute top-0 left-0 right-0" />

      <OnboardingHeader
        currentStep={3}
        title="Invite Your Staff & Directors"
        subtitle="Bring your team into Memoria. Staff members will receive an email invitation to access your cases."
        backUrl="/onboarding/step-2"
      />

      {error && (
        <div className="border-l-2 border-[#9F2F2D] bg-[#FDEBEC] p-3.5 text-xs text-[#9F2F2D] rounded-r mb-6">
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-[#FAF9F7] p-5 rounded border border-[#E5E2DC] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E6E]">
              Staff Colleague Email Addresses
            </h3>
            <span className="text-[11px] text-[#8C7E6E]">Optional • Add up to 10</span>
          </div>

          <div className="space-y-3">
            {emails.map((email, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateEmailRow(idx, e.target.value)}
                  placeholder="assistant.director@mychapel.com"
                  disabled={isLoading}
                  className="flex-1 bg-white border border-[#E5E2DC] rounded p-2.5 text-xs text-[#2C221E] focus:border-[#A8935D] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeEmailRow(idx)}
                  className="w-9 h-9 rounded border border-[#E5E2DC] bg-white text-[#8C7E6E] hover:text-[#9F2F2D] hover:border-[#9F2F2D] transition-colors flex items-center justify-center text-xs"
                  title="Remove email"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {emails.length < 10 && (
            <button
              type="button"
              onClick={addEmailRow}
              disabled={isLoading}
              className="text-xs font-semibold text-[#A8935D] hover:text-[#2C221E] transition-colors flex items-center gap-1.5 pt-1"
            >
              <span>+ Add another colleague email</span>
            </button>
          )}
        </div>

        {/* Security & Access Note */}
        <div className="bg-[#EDF3EC] border border-[#C5D8C4] p-3.5 rounded text-xs text-[#254A28] flex items-start gap-2.5">
          <span className="text-sm">🔒</span>
          <div>
            <strong>Multi-tenant Data Isolation: </strong>
            Invited staff will only see cases and documents belonging to your funeral home.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step-2')}
            className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] transition-colors py-2 px-3 self-start sm:self-auto"
          >
            &larr; Back to States
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => submitInvites(true)}
              disabled={isLoading}
              className="text-xs font-semibold text-[#8C7E6E] hover:text-[#2C221E] py-2 px-4 rounded border border-[#E5E2DC] hover:border-[#B0A393] transition-colors"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={() => submitInvites(false)}
              disabled={isLoading}
              className="btn-primary h-11 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
            >
              {isLoading ? 'Sending Invitations…' : 'Send Invites & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
