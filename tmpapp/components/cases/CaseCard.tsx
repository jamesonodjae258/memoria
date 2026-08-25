import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { CaseRecord, Document } from '@/types'

interface CaseCardProps {
  caseData: CaseRecord
  documents?: Document[]
}

export default function CaseCard({ caseData, documents = [] }: CaseCardProps) {
  // 1. Calculate days since intake
  const intakeDate = new Date(caseData.created_at)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - intakeDate.getTime())
  const daysSinceIntake = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // 2. Check if service is within 48 hours
  let isOverdue = false
  let hoursUntilService: number | null = null

  if (caseData.service_date) {
    const serviceTime = new Date(caseData.service_date).getTime()
    const nowTime = today.getTime()
    const diffHours = (serviceTime - nowTime) / (1000 * 60 * 60)

    if (diffHours > 0 && diffHours <= 48 && caseData.status !== 'approved' && caseData.status !== 'completed') {
      isOverdue = true
      hoursUntilService = Math.round(diffHours)
    }
  }

  // 3. Determine pending action text
  let pendingAction = 'Review case details'

  const obituaryDoc = documents.find((d) => d.type === 'obituary')
  const complianceDoc = documents.find((d) => d.type === 'compliance_form')

  if (caseData.status === 'intake') {
    pendingAction = 'Generate obituary draft & compliance paperwork'
  } else if (caseData.status === 'documents_pending') {
    if (!obituaryDoc) {
      pendingAction = 'Generate initial obituary draft'
    } else if (obituaryDoc.status === 'draft') {
      pendingAction = 'Obituary draft awaiting staff approval'
    } else if (!complianceDoc) {
      pendingAction = 'Pre-fill compliance paperwork'
    } else {
      pendingAction = 'Review missing compliance fields'
    }
  } else if (caseData.status === 'family_review') {
    pendingAction = 'Awaiting family review or confirmation'
  } else if (caseData.status === 'approved') {
    pendingAction = 'All documents approved — ready for service'
  } else if (caseData.status === 'completed') {
    pendingAction = 'Case finalized & archived'
  }

  return (
    <div
      className={`card-premium group flex flex-col justify-between border border-[#E5E2DC] hover:border-[#D2C9BD] transition-all
        ${isOverdue ? 'border-[#9F2F2D] ring-1 ring-[#9F2F2D]/40' : ''}
      `}
    >
      <div>
        {/* Signature Accent Line or Urgent Notice */}
        {isOverdue ? (
          <div className="bg-[#9F2F2D] text-white text-xs font-semibold px-4 py-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Service in {hoursUntilService}h
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-90">Attention Required</span>
          </div>
        ) : (
          <div className="brass-inlay" />
        )}

        {/* Card Body */}
        <div className="p-6">
          {/* Deceased Name & Status Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-lg font-medium text-[#2C221E] tracking-tight leading-snug group-hover:text-[#A8935D] transition-colors">
                {caseData.deceased_name}
              </h3>
              <p className="text-[11px] font-mono text-[#8C7E6E] mt-0.5">
                Intake {daysSinceIntake === 0 ? 'today' : `${daysSinceIntake}d ago`} &bull; {caseData.service_type || 'Burial'}
              </p>
            </div>
            <StatusBadge status={caseData.status} />
          </div>

          {/* Family Contact & Service Details */}
          <div className="text-xs text-[#6B5E50] space-y-2 mb-5 pt-3 border-t border-[#E5E2DC]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#8C7E6E]">Primary Informant:</span>
              <span className="font-medium text-[#2C221E]">
                {caseData.family_contact_name}
                {caseData.relationship_to_deceased && (
                  <span className="text-[#8C7E6E] ml-1">({caseData.relationship_to_deceased})</span>
                )}
              </span>
            </div>

            {caseData.service_date && (
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-[#8C7E6E]">Service Date:</span>
                <span className="font-medium text-[#2C221E]">
                  {new Date(caseData.service_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Required Action Highlight Box */}
          <div className="bg-[#FAF9F7] p-3 rounded border border-[#E5E2DC]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A8935D] mb-1">
              Required Next Step
            </span>
            <p className="text-xs font-medium text-[#2C221E] leading-snug">
              {pendingAction}
            </p>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-[#FAF9F7]/80 px-6 py-3 border-t border-[#E5E2DC] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#8C7E6E]">
          CASE-#{caseData.id.slice(0, 8)}
        </span>
        <Link
          href={`/dashboard/cases/${caseData.id}`}
          className="text-xs font-semibold uppercase tracking-wider text-[#2C221E] group-hover:text-[#A8935D] transition-colors inline-flex items-center gap-1"
        >
          Open Case <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </div>
  )
}
